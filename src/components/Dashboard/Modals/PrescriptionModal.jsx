import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import Button from "../../LandingPage/Navbar/Button";

const getInitialState = (prescription) => ({
  patientId: prescription?.patientId || "",
  patientName: prescription?.patientName || "",
  doctorId: prescription?.doctorId || "",
  doctorName: prescription?.doctorName || "",
  date: prescription?.date || new Date().toISOString().split("T")[0],
  medications: prescription?.medications || [{ name: "", dosage: "", frequency: "", duration: "" }],
  instructions: prescription?.instructions || "",
});

const PrescriptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  prescription = null,
  patients = [],
  doctors = [],
}) => {
  const [formData, setFormData] = useState(getInitialState(prescription));

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "", duration: "" }],
    }));
  };

  const removeMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.medications];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, medications: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPatient = patients.find((item) => item.id === formData.patientId);
    const selectedDoctor = doctors.find((item) => item.id === formData.doctorId);

    onSubmit({
      ...formData,
      patientName: selectedPatient?.fullName || formData.patientName,
      doctorName: selectedDoctor?.fullName || formData.doctorName,
      medications: formData.medications.filter(
        (item) => item.name && item.dosage && item.frequency && item.duration
      ),
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {prescription ? "Edit Prescription" : "Create Prescription"}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Patient *</label>
                      <select
                        value={formData.patientId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        required
                      >
                        <option value="">Select patient</option>
                        {patients.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Doctor *</label>
                      <select
                        value={formData.doctorId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
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

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
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
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Medicines</label>
                      <Button type="button" variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addMedication}>
                        Add
                      </Button>
                    </div>
                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                      {formData.medications.map((medication, index) => (
                        <div key={`medication-${index}`} className="grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 md:grid-cols-12">
                          <input
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none md:col-span-3"
                            placeholder="Medicine"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, "name", e.target.value)}
                            required
                          />
                          <input
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none md:col-span-3"
                            placeholder="Dosage"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            required
                          />
                          <input
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none md:col-span-3"
                            placeholder="Frequency"
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                            required
                          />
                          <input
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none md:col-span-2"
                            placeholder="Duration"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, "duration", e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="inline-flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 md:col-span-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      placeholder="Usage instructions or additional notes"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      {prescription ? "Update" : "Save"} Prescription
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

export default PrescriptionModal;
