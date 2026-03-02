import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Calendar, Clock, User, Video, X } from "lucide-react";
import Button from "../../LandingPage/Navbar/Button";

const getInitialState = (appointment) => ({
  patientId: appointment?.patientId || "",
  patientName: appointment?.patientName || "",
  doctorId: appointment?.doctorId || "",
  doctorName: appointment?.doctorName || "",
  date: appointment?.date || "",
  time: appointment?.time || "",
  type: appointment?.type || "consultation",
  status: appointment?.status || "pending",
  isVideo: Boolean(appointment?.isVideo),
  notes: appointment?.notes || "",
});

const AppointmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  appointment = null,
  patients = [],
  doctors = [],
  showStatus = true,
}) => {
  const [formData, setFormData] = useState(getInitialState(appointment));

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPatient = patients.find((item) => item.id === formData.patientId);
    const selectedDoctor = doctors.find((item) => item.id === formData.doctorId);

    onSubmit({
      ...formData,
      patientName: selectedPatient?.fullName || formData.patientName,
      doctorName: selectedDoctor?.fullName || formData.doctorName,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {appointment ? "Edit Appointment" : "Book Appointment"}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Patient *</label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <select
                          value={formData.patientId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          required
                        >
                          <option value="">Select patient</option>
                          {patients.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.fullName} ({item.phone || "No phone"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Doctor *</label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <select
                          value={formData.doctorId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          required
                        >
                          <option value="">Select doctor</option>
                          {doctors.map((item) => (
                            <option key={item.id} value={item.id}>
                              Dr. {item.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Time *</label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Appointment Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="checkup">Checkup</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    {showStatus ? (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ) : null}
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isVideo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isVideo: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <Video className="h-4 w-4 text-gray-500" />
                    Video consultation
                  </label>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      {appointment ? "Update" : "Book"} Appointment
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AppointmentModal;
