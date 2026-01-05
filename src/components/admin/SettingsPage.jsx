import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const SettingsPage = ({ darkMode, toggleTheme, cardClasses }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Manage your application settings</p>
      </div>

      <Card className={`${cardClasses} p-6`}>
        <h3 className="text-xl font-bold mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-semibold">Dark Mode</Label>
            <p className="text-sm text-slate-500">Toggle dark mode theme</p>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleTheme} />
        </div>
      </Card>

      <Card className={`${cardClasses} p-6`}>
        <h3 className="text-xl font-bold mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Email Notifications</Label>
              <p className="text-sm text-slate-500">Receive email updates</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Booking Alerts</Label>
              <p className="text-sm text-slate-500">Get notified on new bookings</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;