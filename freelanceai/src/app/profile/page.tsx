"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (e) {
        console.error("Error loading profile", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    if (cvFile) {
      formData.append("cv", cvFile);
    }
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setMessage("Cập nhật hồ sơ thành công!");
        setMessageType("success");
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, ...data }));
        router.refresh();
      } else {
        setMessage("Đã xảy ra lỗi khi cập nhật hồ sơ.");
        setMessageType("error");
      }
    } catch (e) {
      setMessage("Lỗi không mong muốn. Vui lòng thử lại.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  // Format dateOfBirth for input[type=date]
  function formatDateForInput(dateStr: string | null | undefined) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  }

  const currentAvatar = avatarPreview || profile?.avatar;

  if (loading) return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="ml-64 pt-24 px-10">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <p>Đang tải hồ sơ...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={profile?.role} />

      <main className="ml-64 pt-24 pb-20 px-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-on-surface">Chỉnh sửa hồ sơ</h1>
            <p className="text-on-surface-variant mt-2">
              Bổ sung thông tin chi tiết để kết nối với {profile?.role === "FREELANCER" ? "khách hàng" : "freelancer"} tốt hơn.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* Thông báo */}
            {message && (
              <div className={`p-4 rounded-xl font-medium border flex items-center gap-3 ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {messageType === "success" ? "check_circle" : "error"}
                </span>
                {message}
              </div>
            )}

            {/* ===== CARD: Avatar ===== */}
            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
              <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                Ảnh đại diện
              </h2>
              <div className="flex items-center gap-6">
                {/* Avatar preview */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Avatar"
                      className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-md transition-all group-hover:opacity-80"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-4 border-primary/20 shadow-md transition-all group-hover:opacity-80">
                      <span className="text-primary font-black text-3xl">
                        {profile?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Chọn ảnh mới
                  </button>
                  <p className="text-xs text-on-surface-variant">Ảnh vuông, tối đa 2MB. JPG, PNG, WEBP.</p>
                  {avatarPreview && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Ảnh mới đã được chọn
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="avatar"
                    id="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </section>

            {/* ===== CARD: Thông tin cá nhân ===== */}
            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
              <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface uppercase tracking-wider" htmlFor="cv">
                    Hồ sơ năng lực (CV - PDF)
                  </label>
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setCvFile(e.target.files[0]);
                      }
                    }}
                    className="bg-surface p-2 rounded-xl border border-outline/30 text-xs"
                  />
                  {profile?.cvUrl && (
                    <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Đã tải lên CV: <a href={profile.cvUrl} target="_blank" className="underline">Xem CV</a>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="name">Họ và tên *</label>
                  <input
                    required
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={profile?.name || ""}
                    placeholder="Nguyễn Văn A"
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    defaultValue={formatDateForInput(profile?.dateOfBirth)}
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="location">Địa điểm</label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    defaultValue={profile?.location || ""}
                    placeholder="TP. Hồ Chí Minh, Việt Nam"
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="university">Trường đại học</label>
                  <input
                    type="text"
                    name="university"
                    id="university"
                    defaultValue={profile?.university || ""}
                    placeholder="Đại học Bách Khoa TP.HCM"
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </section>

            {/* ===== CARD: Thông tin nghề nghiệp (FREELANCER) ===== */}
            {profile?.role === "FREELANCER" && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
                <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work</span>
                  Thông tin nghề nghiệp
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-sm text-on-surface" htmlFor="title">Chức danh chuyên môn</label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        defaultValue={profile?.title || ""}
                        placeholder="Senior Fullstack Developer"
                        className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-sm text-on-surface" htmlFor="hourlyRate">Mức thù lao ($/giờ)</label>
                      <input
                        type="text"
                        name="hourlyRate"
                        id="hourlyRate"
                        defaultValue={profile?.hourlyRate || ""}
                        placeholder="50"
                        className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="skills">Kỹ năng (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      defaultValue={profile?.skills || ""}
                      placeholder="React, Node.js, TypeScript, Python"
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="bio">Giới thiệu bản thân</label>
                    <textarea
                      name="bio"
                      id="bio"
                      defaultValue={profile?.bio || ""}
                      rows={4}
                      placeholder="Mô tả kinh nghiệm, thế mạnh và phong cách làm việc của bạn..."
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* ===== CARD: Thông tin công ty (CLIENT) ===== */}
            {profile?.role === "CLIENT" && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-6">
                <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">business</span>
                  Thông tin công ty
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-sm text-on-surface" htmlFor="companyName">Tên công ty</label>
                      <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        defaultValue={profile?.companyName || ""}
                        className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-sm text-on-surface" htmlFor="companyWebsite">Website công ty</label>
                      <input
                        type="text"
                        name="companyWebsite"
                        id="companyWebsite"
                        defaultValue={profile?.companyWebsite || ""}
                        placeholder="https://company.com"
                        className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="companyDescription">Mô tả công ty</label>
                    <textarea
                      name="companyDescription"
                      id="companyDescription"
                      defaultValue={profile?.companyDescription || ""}
                      rows={3}
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Nút lưu */}
            <div className="flex justify-end">
              <button
                disabled={saving}
                type="submit"
                className="bg-primary text-on-primary font-bold py-3 px-10 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-70 flex items-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Lưu hồ sơ
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
