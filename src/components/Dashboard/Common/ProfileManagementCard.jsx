import { useEffect, useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { updateUserProfile } from "../../../services/clinicFirestoreService";
import { uploadImageToCloudinary } from "../../../utils/cloudinary";
import Swal from "../../../utils/swal";
import ActionButton from "./ActionButton";
import ProfileCard from "./ProfileCard";

const ProfileManagementCard = ({ user, onUpdated }) => {
  const { refreshProfile } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  useEffect(() => {
    setProfileDraft({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      photoURL: user?.photoURL || "",
    });
  }, [user]);

  const profileView = useMemo(
    () => ({
      ...user,
      ...profileDraft,
      photoURL: profileDraft.photoURL || user?.photoURL || "",
    }),
    [profileDraft, user]
  );

  const triggerSync = async () => {
    await Promise.all([onUpdated?.(), refreshProfile?.()]);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        fullName: profileDraft.fullName,
        phone: profileDraft.phone,
        address: profileDraft.address,
        photoURL: profileDraft.photoURL || null,
      });
      setEditingProfile(false);
      await triggerSync();
      await Swal.success("Profile Updated", "Your profile has been updated.");
    } catch {
      await Swal.error("Update Failed", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      await Swal.warning("Invalid File", "Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      await Swal.warning("File Too Large", "Please upload an image up to 2MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      await updateUserProfile(user.id, { photoURL: secureUrl });
      setProfileDraft((prev) => ({ ...prev, photoURL: secureUrl }));
      await triggerSync();
      await Swal.success("Photo Updated", "Profile photo uploaded successfully.");
    } catch {
      await Swal.error("Upload Failed", "Could not upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div>
      <ProfileCard user={profileView} />
      <div className="mt-4 rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Edit Profile</h3>
          <ActionButton
            size="sm"
            variant="ghost"
            onClick={() => setEditingProfile((prev) => !prev)}
          >
            {editingProfile ? "Close" : "Edit"}
          </ActionButton>
        </div>

        {editingProfile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
              <img
                src={
                  profileDraft.photoURL ||
                  `https://ui-avatars.com/api/?name=${profileDraft.fullName || "User"}&background=random`
                }
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-blue-300">
                <ImagePlus className="h-4 w-4" />
                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>

            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Full name"
              value={profileDraft.fullName}
              onChange={(e) =>
                setProfileDraft((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Phone"
              value={profileDraft.phone}
              onChange={(e) =>
                setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Address"
              value={profileDraft.address}
              onChange={(e) =>
                setProfileDraft((prev) => ({ ...prev, address: e.target.value }))
              }
            />

            <ActionButton size="sm" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </ActionButton>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Update profile info and photo from here.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileManagementCard;

