import { FileText, Download, Calendar, User } from "lucide-react";
import Button from "../../LandingPage/Navbar/Button";
import { cn } from "../../../lib/utils";

const PrescriptionCard = ({ prescription, onDownload, className }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-md border border-gray-100 p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prescription.medication}</h3>
            <p className="text-sm text-gray-500">Dosage: {prescription.dosage}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <p>Duration: {prescription.duration}</p>
        <p>Instructions: {prescription.instructions}</p>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          {new Date(prescription.date).toLocaleDateString()}
        </div>
        {prescription.doctorName && (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1 text-gray-400" />
            Dr. {prescription.doctorName}
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        fullWidth
        leftIcon={<Download className="w-4 h-4" />}
        onClick={() => onDownload?.(prescription)}
      >
        Download PDF
      </Button>
    </div>
  );
};

export default PrescriptionCard;