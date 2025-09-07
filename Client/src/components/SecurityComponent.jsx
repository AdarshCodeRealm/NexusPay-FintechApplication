import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { 
  Shield, 
  Smartphone,
  Lock,
  Bell,
  Eye
} from 'lucide-react';

const SecurityComponent = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Security Settings</h1>
            <p className="text-green-100">Manage your account security and privacy</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h3>
        
        <div className="space-y-6">
          {/* Phone Verification */}
          <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Phone Verification</p>
                <p className="text-sm text-gray-500">{user?.phone}</p>
              </div>
            </div>
            <div className={`px-3 py-1 text-xs font-medium rounded-full ${
              user?.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user?.phoneVerified ? 'Verified' : 'Not Verified'}
            </div>
          </div>

          {/* Change Password */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                Change
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg">
                Enable
              </Button>
            </div>
          </div>

          {/* Security Notifications */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Security Notifications</p>
                  <p className="text-sm text-gray-500">Get alerts for account activities</p>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Login History</p>
                <p className="text-sm text-gray-500">Recent account access</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Current session</span>
                  <p className="text-gray-500">Chrome • Windows</p>
                </div>
                <span className="text-green-600 font-medium">Active now</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Previous session</span>
                  <p className="text-gray-500">Mobile App • Android</p>
                </div>
                <span className="text-gray-500">Today at 2:30 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Web session</span>
                  <p className="text-gray-500">Firefox • Windows</p>
                </div>
                <span className="text-gray-500">Yesterday at 10:15 AM</span>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-4">Privacy Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Profile visibility</p>
                  <p className="text-xs text-gray-500">Control who can see your profile information</p>
                </div>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Public</option>
                  <option>Friends only</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Transaction privacy</p>
                  <p className="text-xs text-gray-500">Hide transaction details from others</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email notifications</p>
                  <p className="text-xs text-gray-500">Receive security alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityComponent;