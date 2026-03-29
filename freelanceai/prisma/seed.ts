import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const libsql = createClient({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const adapter = new PrismaLibSql(libsql as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Đang dọn dẹp Database cũ...')
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.user.deleteMany()

  console.log('Bắt đầu mã hóa mật khẩu chung (123456)...')
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1. Tạo Client
  const client1 = await prisma.user.create({
    data: {
      email: 'client@tech.com',
      password: passwordHash,
      name: 'VNG Corporation',
      role: 'CLIENT',
      title: 'Tập đoàn Công nghệ Hàng đầu',
    }
  })
  
  const client2 = await prisma.user.create({
    data: {
      email: 'startup@tech.com',
      password: passwordHash,
      name: 'Startup AI Vietnam',
      role: 'CLIENT',
      title: 'AI Startup',
    }
  })

  // 2. Tạo Freelancer
  const freelancer1 = await prisma.user.create({
    data: {
      email: 'dev@freelance.com',
      password: passwordHash,
      name: 'Nguyễn Văn Dev',
      role: 'FREELANCER',
      title: 'Senior Fullstack Engineer',
      skills: 'React, Next.js, Node.js, Prisma',
      matchScore: 94
    }
  })

  const freelancer2 = await prisma.user.create({
    data: {
      email: 'design@freelance.com',
      password: passwordHash,
      name: 'Lê Hà My',
      role: 'FREELANCER',
      title: 'UI/UX Designer',
      skills: 'Figma, UI/UX, Web3, Illustrator',
      matchScore: 98
    }
  })

  // 3. Tạo Jobs
  console.log('Đang tạo các tin tuyển dụng (Jobs)...')
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior UI/UX Designer for Fintech (Web3)',
      description: 'Chúng tôi đang tìm kiếm một UI/UX Designer dày dạn kinh nghiệm để thiết kế giao diện ứng dụng ví điện tử Web3. Bắt buộc có kiến thức về hệ thống grid và typography hiện đại.',
      budget: '35,000,000 VND',
      clientId: client1.id,
      status: 'OPEN'
    }
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Fullstack Next.js + Prisma Developer',
      description: 'Cần một kỹ sư phát triển phần mềm kinh nghiệm xây dựng nền tảng Freelance từ con số 0. Yêu cầu thành thạo App Router, Tailwind v4 và SQLite. Ưu tiên có mặt tại TP.HCM.',
      budget: '50,000,000 VND',
      clientId: client2.id,
      status: 'OPEN'
    }
  })
  
  const job3 = await prisma.job.create({
    data: {
      title: 'Freelance Logo & Branding Identity',
      description: 'Tôi cần một bộ nhận diện thương hiệu cho dự án AI mới của mình. Gồm logo, màu chủ đạo, font chữ và các template cơ bản cho mạng xã hội.',
      budget: '15,000,000 VND',
      clientId: client2.id,
      status: 'OPEN'
    }
  })

  // 4. Tạo Applications
  console.log('Đang giả lập hồ sơ ứng tuyển (Applications)...')
  await prisma.application.create({
    data: {
      freelancerId: freelancer2.id,
      jobId: job1.id,
      matchScore: 97,
      status: 'PENDING'
    }
  })
  
  await prisma.application.create({
    data: {
      freelancerId: freelancer1.id,
      jobId: job2.id,
      matchScore: 92,
      status: 'REVIEWING'
    }
  })

  console.log('Tất cả Dữ Liệu giả lập (Seed) đã được bơm thành công vào SQLite!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
