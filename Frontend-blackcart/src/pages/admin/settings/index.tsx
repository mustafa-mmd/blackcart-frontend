import React, { useState } from 'react';
import { Settings, Globe } from 'lucide-react';
import GeneralSettings from './GeneralSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your store settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 transition
                ${activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'general' && <GeneralSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;