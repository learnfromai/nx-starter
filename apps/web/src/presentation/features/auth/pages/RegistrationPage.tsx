import React from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { RegistrationForm } from '../components/RegistrationForm';

export const RegistrationPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <RegistrationForm />
        </div>
      </div>
    </MainLayout>
  );
};