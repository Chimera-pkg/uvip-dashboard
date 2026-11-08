export interface TeamMember {
  id: string;
  name: string;
  institution: string;
  contribution: string;
  email: string;
  photoUrl: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Eng. Ar. Ir. Herry Santosa, ST., MT., IAI, IPM., ASEAN Eng.",
    institution: "Arsitektur · Universitas Brawijaya",
    contribution:
      "Ketua tim peneliti; bangunan digital 3D dan manajemen aset digital",
    email: "herrysantosa@ub.ac.id",
    photoUrl: "/assets/tim/foto-1.jpeg",
  },
  {
    id: "2",
    name: "Adipandang Yudono, S.Si., M.U.R.P., Ph.D",
    institution: "Perencanaan Wilayah dan Kota · Universitas Brawijaya",
    contribution:
      "Anggota tim peneliti; sains data spasial, pemrograman dan pengembangan GIS, kota cerdas, dan GeoAI",
    email: "adipandang@ub.ac.id",
    photoUrl: "/assets/tim/foto-2.jpeg",
  },
  {
    id: "3",
    name: "Dr. Eng. Ir. Herman Tolle, S.T., M.T.",
    institution: "Ilmu Komputer · Universitas Brawijaya",
    contribution:
      "Anggota tim peneliti; teknologi informasi, sistem cerdas, dan interaksi manusia–komputer",
    email: "emang@ub.ac.id",
    photoUrl: "/assets/tim/foto-3.jpeg",
  },
  {
    id: "4",
    name: "Prof. Ir. Jenny Ernawati, MSP, Ph.D, CIQnR., CIQaR.",
    institution: "Arsitektur · Universitas Brawijaya",
    contribution:
      "Anggota tim peneliti; arsitektur, perancangan kota, dan lingkungan binaan",
    email: "jenny_ernawati@ub.ac.id",
    photoUrl: "/assets/tim/foto-4.jpeg",
  },
  {
    id: "5",
    name: "Agung Setia Budi, S.T., M.T., M.Eng., Ph.D.",
    institution: "Ilmu Komputer · Universitas Brawijaya",
    contribution:
      "Anggota tim peneliti; kecerdasan buatan, visi komputer, dan sains data",
    email: "agungsetiabudi@ub.ac.id",
    photoUrl: "/assets/tim/foto-5.jpeg",
  },
  {
    id: "6",
    name: "Anna Jihad Fatihah, S.Sn., M.Ds",
    institution: "PT Wolftagon Future Innovation",
    contribution: "Koordinasi mitra industri dan desain UI/UX",
    email: "anna@wolftagon.com",
    photoUrl: "/assets/tim/foto-6.jpeg",
  },
  {
    id: "7",
    name: "Adryan Prawira, S.Tr.Kom",
    institution: "PT Wolftagon Future Innovation",
    contribution: "Pengembangan aplikasi dan integrasi AI",
    email: "adryanp@wolftagon.com",
    photoUrl: "/assets/tim/foto-7.jpeg",
  },
];
