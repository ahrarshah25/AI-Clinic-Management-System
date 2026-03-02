import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import { cn } from "../../../lib/utils";
import StatusBadge from "./StatusBadge";
import Button from "./ActionButton";

const ProfileCard = ({ user, onEdit, className }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-center gap-4">
          <img
            src={ user.photoURL || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
            alt={user.fullName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold">{user.fullName}</h2>
            <p className="text-blue-100">{user.email}</p>
            {user.role && <StatusBadge status={user.role} className="mt-2" />}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Mail className="w-5 h-5 mr-3 text-gray-400" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-gray-400" />
              {user.phone}
            </div>
          )}
          {user.address && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-gray-400" />
              {user.address}
            </div>
          )}
          {user.dob && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3 text-gray-400" />
              {new Date(user.dob).toLocaleDateString()}
            </div>
          )}
        </div>

        {onEdit && (
          <div className="pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
