import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import axios from 'axios'
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
const Appointments = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const navigate = useNavigate()
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  // Review & AI Summary states
  const [reviews, setReviews] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/user/reviews/${docId}`)
      if (data.success) {
        setReviews(data.reviews)
        setAiSummary(data.aiSummary)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.warn('Please login to leave a review')
      return
    }
    if (!comment.trim()) {
      toast.warn('Please write a review comment')
      return
    }

    setSubmittingReview(true)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/add-review',
        { doctorId: docId, rating, comment },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        setComment('')
        setRating(5)
        fetchReviews()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmittingReview(false)
    }
  }
  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    if (!docInfo || !docInfo.slots_booked) {
      return; // Exit function early if docInfo is null or slots_booked is undefined
    }

    setDocSlots([])

    let today = new Date()
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endtime = new Date()
      endtime.setDate(today.getDate() + i)
      endtime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)

      }
      else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []
      while (currentDate < endtime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const slotTime = formattedTime

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }


        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev, timeSlots]))

    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book Appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      toast.warn('Please select a time slot')
      return
    }

    try {
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth() + 1;
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year
      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      }
      else {
        toast.error(data.message)
      }

    }
    catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])


  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  useEffect(() => {

  }, [docSlots])

  useEffect(() => {
    fetchReviews()
  }, [docId])


  if (!docInfo) {
    return <p>Not Found...</p>;
  }
  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-4 mx-3 md:mx-5 lg:mx-8'>
        <div>
          <img className='bg-[#1D2129] rounded-lg w-full sm:max-w-72' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border-2 border-gray-400 rounded-lg p-8 py-7 mx-2 sm:mx-0 sm:mt-0'>
          <p className='flex gap-2 items-center text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full' >{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img className='cursor-pointer' src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      <div className='mx-4 md:mx-8 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-[#1D2129] text-white' : 'border border-gray-400'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-[#1D2129] text-white' : ' text-gray-400 border border-gray-400'}`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <div>
          <button onClick={bookAppointment} className='bg-[#1D2129] rounded-full text-white text-sm font-light px-14 py-3 my-6'>Book an Appointment</button>
        </div>
      </div>

      {/* Reviews & AI Summary Section */}
      <div className='mx-4 md:mx-8 lg:mx-12 mt-12 border-t border-zinc-200 pt-8'>
        <h3 className='text-2xl font-semibold text-neutral-800 mb-6'>Patient Reviews & Feedback</h3>

        {/* AI Summary Block */}
        {reviews.length > 0 && (
          <div className='bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-sm'>
            <div className='bg-indigo-600 text-white rounded-xl p-2.5 flex items-center justify-center flex-shrink-0'>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div>
              <h4 className='text-sm font-bold text-indigo-950 uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                AI-Generated Summary
              </h4>
              <p className='text-indigo-900/80 text-sm leading-relaxed'>{aiSummary}</p>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          /* Centered layout for when there are no reviews */
          <div className='flex flex-col items-center justify-center py-6'>
            <div className='bg-white border border-zinc-200 shadow-xl rounded-2xl p-8 w-full max-w-md text-center'>
              <h4 className='text-xl font-bold text-neutral-800 mb-2'>Be the first to review</h4>
              <p className='text-zinc-400 text-sm mb-6'>Share your consultation experience with {docInfo.name} to help other patients.</p>

              {token ? (
                <form onSubmit={submitReview} className='space-y-4 text-left'>
                  <div>
                    <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2'>Rating</label>
                    <div className='flex justify-center gap-1.5'>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starVal = idx + 1;
                        return (
                          <button
                            key={idx}
                            type='button'
                            onClick={() => setRating(starVal)}
                            className={`text-2xl transition-all hover:scale-110 ${starVal <= rating ? 'text-amber-400' : 'text-zinc-300'}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className='w-full border border-zinc-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all text-sm'
                      placeholder='How was your experience with the doctor?'
                      rows={4}
                      required
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={submittingReview}
                    className='w-full bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 text-xs'
                  >
                    {submittingReview ? 'Submitting Review...' : 'Submit Feedback'}
                  </button>
                </form>
              ) : (
                <div className='text-center py-6 bg-zinc-50 rounded-xl border border-zinc-200/50'>
                  <p className='text-zinc-500 text-sm mb-4'>You must be logged in as a patient to submit feedback.</p>
                  <button
                    type='button'
                    onClick={() => navigate('/login')}
                    className='bg-[#1D2129] text-white font-semibold py-2 px-6 rounded-lg text-xs hover:bg-neutral-800 transition-all shadow-sm'
                  >
                    Login to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Two-column layout when reviews exist */
          <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-start'>
            {/* Review List */}
            <div className='space-y-6'>
              <h4 className='text-lg font-bold text-neutral-800 mb-4'>Patient Comments ({reviews.length})</h4>
              <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2'>
                {reviews.map((r, i) => (
                  <div key={i} className='bg-zinc-50 border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <p className='font-bold text-neutral-800 text-sm'>{r.userName}</p>
                        <div className='flex items-center gap-1 mt-0.5'>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className={`text-sm ${idx < r.rating ? 'text-amber-400' : 'text-zinc-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className='text-xs text-zinc-400'>{new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className='text-zinc-600 text-sm leading-relaxed mt-2'>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Review Form */}
            <div className='bg-white border border-zinc-200 shadow-lg rounded-2xl p-6 w-full'>
              <h4 className='text-lg font-bold text-neutral-800 mb-4'>Share Your Experience</h4>

              {token ? (
                <form onSubmit={submitReview} className='space-y-4'>
                  <div>
                    <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2'>Rating</label>
                    <div className='flex gap-1.5'>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starVal = idx + 1;
                        return (
                          <button
                            key={idx}
                            type='button'
                            onClick={() => setRating(starVal)}
                            className={`text-2xl transition-all hover:scale-110 ${starVal <= rating ? 'text-amber-400' : 'text-zinc-300'}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1'>Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className='w-full border border-zinc-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all text-sm'
                      placeholder='How was your experience with the doctor?'
                      rows={4}
                      required
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={submittingReview}
                    className='w-full bg-[#1D2129] text-white hover:bg-neutral-800 font-semibold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 text-xs'
                  >
                    {submittingReview ? 'Submitting Review...' : 'Submit Feedback'}
                  </button>
                </form>
              ) : (
                <div className='text-center py-6 bg-zinc-50 rounded-xl border border-zinc-200/50'>
                  <p className='text-zinc-500 text-sm mb-4'>You must be logged in as a patient to submit feedback.</p>
                  <button
                    type='button'
                    onClick={() => navigate('/login')}
                    className='bg-[#1D2129] text-white font-semibold py-2 px-6 rounded-lg text-xs hover:bg-neutral-800 transition-all shadow-sm'
                  >
                    Login to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointments