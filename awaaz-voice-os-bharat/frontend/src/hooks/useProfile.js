import { useState, useEffect } from "react";

const PROFILE_KEY = "awaaz_profile";

const defaultProfile = {
  name: "", phone: "", aadhaar: "",
  village: "", district: "", state: "",
  pincode: "", preferredLanguage: "hi",
};

export const useProfile = () => {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      if (stored.name || stored.phone) setProfile({ ...defaultProfile, ...stored });
    } catch {}
  }, []);

  const saveProfile = (data) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    if (updated.phone) localStorage.setItem("awaaz_phone", updated.phone);
    return updated;
  };

  const updateField = (field, value) => setProfile((p) => ({ ...p, [field]: value }));

  return { profile, saveProfile, updateField };
};
