import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import AuthContextProvider from '../AuthContext';
import { AppContext } from '../AppContext';
import React from 'react';

// Mock AppContext
const MockAppProvider = ({ children }) => (
    <AppContext.Provider value={{ backendUrl: 'http://localhost' }}>
        {children}
    </AppContext.Provider>
);

vi.mock('axios');

describe('AuthContext Interceptors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with no token', () => {
        let contextValue;
        render(
            <MockAppProvider>
                <AuthContextProvider>
                    <AuthContext.Consumer>
                        {value => {
                            contextValue = value;
                            return null;
                        }}
                    </AuthContext.Consumer>
                </AuthContextProvider>
            </MockAppProvider>
        );

        expect(contextValue.token).toBe('');
    });
});
