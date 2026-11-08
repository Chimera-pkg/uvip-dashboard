import { useState } from "react";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { teamMembers, type TeamMember } from "../data/teamData";

export default function ProjectTeamPage() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
          Tim Proyek
        </h1>
        <p className="text-slate-500 text-sm m-0">
          Tim di balik proyek UrbanLens AI.
        </p>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map((member: TeamMember) => {
          const hasError = imageErrors[member.id];

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6"
            >
              {/* Photo Box */}
              <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-gray-100 shadow-xs relative flex items-center justify-center">
                {!hasError ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(member.id)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 text-slate-400 p-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-slate-500 text-lg font-bold mb-2">
                      {member.name.charAt(0)}
                    </div>
                    <UserOutlined className="text-sm text-slate-300" />
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                {/* NAMA LENGKAP */}
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                  Nama Lengkap
                </div>
                <h3
                  className="text-base sm:text-lg font-bold text-slate-800 leading-snug mb-3.5"
                  title={member.name}
                >
                  {member.name}
                </h3>

                {/* INSTITUSI */}
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">
                  Institusi
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-3.5">
                  {member.institution}
                </p>

                {/* KONTRIBUSI */}
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">
                  Kontribusi
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3.5">
                  {member.contribution}
                </p>

                {/* ALAMAT EMAIL */}
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">
                  Alamat Email
                </div>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium break-all transition-colors"
                >
                  <MailOutlined className="text-blue-400 text-xs shrink-0" />
                  <span>{member.email}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
