import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavigationBar from '../NavigationBar';
import { AuthContext } from '../../context/AuthContext';
import { AdminContext } from '../../context/AdminContext';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

// Mock dependencies
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NavigationBar Component', () => {
  it('renders admin panel header when admin token is present', () => {
    render(
      <MemoryRouter>
        <AppContext.Provider value={{ backendUrl: 'http://localhost' }}>
          <AuthContext.Provider value={{ atoken: 'mock-admin-token', setAToken: vi.fn(), dtoken: '', setDToken: vi.fn() }}>
            <AdminContext.Provider value={{ setDashData: vi.fn(), setAdminDoctors: vi.fn() }}>
              <DoctorContext.Provider value={{ setProfileData: vi.fn(), setDoctorAppointments: vi.fn() }}>
                <NavigationBar />
              </DoctorContext.Provider>
            </AdminContext.Provider>
          </AuthContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders doctor panel header when doctor token is present', () => {
    render(
      <MemoryRouter>
        <AppContext.Provider value={{ backendUrl: 'http://localhost' }}>
          <AuthContext.Provider value={{ atoken: '', setAToken: vi.fn(), dtoken: 'mock-doc-token', setDToken: vi.fn() }}>
            <AdminContext.Provider value={{ setDashData: vi.fn(), setAdminDoctors: vi.fn() }}>
              <DoctorContext.Provider value={{ setProfileData: vi.fn(), setDoctorAppointments: vi.fn() }}>
                <NavigationBar />
              </DoctorContext.Provider>
            </AdminContext.Provider>
          </AuthContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Doctor Panel')).toBeInTheDocument();
  });

  it('calls logout and navigates to home when logout button is clicked', async () => {
    const setATokenMock = vi.fn();
    
    render(
      <MemoryRouter>
        <AppContext.Provider value={{ backendUrl: 'http://localhost' }}>
          <AuthContext.Provider value={{ atoken: 'mock-admin-token', setAToken: setATokenMock, dtoken: '', setDToken: vi.fn() }}>
            <AdminContext.Provider value={{ setDashData: vi.fn(), setAdminDoctors: vi.fn() }}>
              <DoctorContext.Provider value={{ setProfileData: vi.fn(), setDoctorAppointments: vi.fn() }}>
                <NavigationBar />
              </DoctorContext.Provider>
            </AdminContext.Provider>
          </AuthContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await vi.waitFor(() => {
      expect(setATokenMock).toHaveBeenCalledWith('');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
