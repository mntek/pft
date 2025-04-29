import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPageMinimal() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <div className="flex border-b">
        <button 
          className="px-4 py-2 font-medium border-b-2 border-primary"
          onClick={() => window.location.hash = 'profile'}
        >
          Profile
        </button>
        <button 
          className="px-4 py-2 font-medium" 
          onClick={() => window.location.hash = 'password'}
        >
          Password
        </button>
        <button 
          className="px-4 py-2 font-medium"
          onClick={() => window.location.hash = 'preferences'}
        >
          Preferences
        </button>
      </div>
      
      <div className="mt-6">
        {window.location.hash === '#password' ? (
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Password settings content here</p>
            </CardContent>
          </Card>
        ) : window.location.hash === '#preferences' ? (
          <Card>
            <CardHeader>
              <CardTitle>Currency and Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Default Currency: USD</p>
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Dark Mode</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Enable Notifications</span>
                </label>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    defaultValue="mert.ece"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded" 
                    defaultValue="mert.ece@example.com"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}