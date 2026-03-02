import { Calendar, Clock, User, Video } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "../../LandingPage/Navbar/Button";
import { cn } from "../../../lib/utils";

const AppointmentCard = ({ appointment, onJoin, onReschedule, onCancel, className }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment.patientName || appointment.doctorName}
          </h3>
          <p className="text-sm text-gray-500">{appointment.type}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {new Date(appointment.date).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          {appointment.time}
        </div>
        {appointment.isVideo && (
          <div className="flex items-center text-sm text-blue-600">
            <Video className="w-4 h-4 mr-2" />
            Video Consultation
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {appointment.status === "confirmed" && appointment.isVideo && (
          <Button size="sm" variant="primary" onClick={() => onJoin?.(appointment)}>
            Join Call
          </Button>
        )}
        {appointment.status === "pending" && (
          <>
            <Button size="sm" variant="outline" onClick={() => onReschedule?.(appointment)}>
              Reschedule
            </Button>
            <Button size="sm" variant="danger" onClick={() => onCancel?.(appointment)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;