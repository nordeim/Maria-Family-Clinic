// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simplified database seeding...')

  // Clean existing data
  await prisma.User.deleteMany()
  await prisma.Clinic.deleteMany()
  await prisma.Service.deleteMany()

  // Create users
  const adminUser = await prisma.User.create({
    data: {
      email: 'admin@clinic.sg',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const patientUser = await prisma.User.create({
    data: {
      email: 'patient@example.sg',
      name: 'John Doe',
      role: 'PATIENT',
    },
  })

  // Create clinics
  const clinic1 = await prisma.Clinic.create({
    data: {
      name: 'Family Health Clinic',
      address: '123 Orchard Road, Singapore',
      phone: '+65-6234-5678',
      email: 'contact@familyhealth.sg',
      website: 'https://familyhealth.sg',
      description: 'Comprehensive family healthcare services',
      isActive: true,
    },
  })

  const clinic2 = await prisma.Clinic.create({
    data: {
      name: 'Care Medical Centre',
      address: '456 Orchard Road, Singapore',
      phone: '+65-6234-9999',
      email: 'info@caremedical.sg',
      description: 'Modern medical facility with specialist services',
      isActive: true,
    },
  })

  // Create core services
  const services = [
    // General Practice
    {
      name: 'General Consultation',
      category: 'GENERAL_PRACTICE',
      subcategory: 'Primary Care',
      mohCode: 'GP001',
      typicalDurationMin: 30,
      complexityLevel: 'BASIC',
      urgencyLevel: 'ROUTINE',
      basePrice: 35,
      priceRangeMin: 25,
      priceRangeMax: 50,
      isHealthierSGCovered: true,
      medicalDescription: 'Initial consultation with family physician',
      patientFriendlyDesc: 'General check-up with doctor',
      preparationSteps: ['Bring NRIC', 'List current medications'],
    },
    {
      name: 'Follow-up Consultation',
      category: 'GENERAL_PRACTICE',
      subcategory: 'Follow-up Care',
      mohCode: 'GP002',
      typicalDurationMin: 20,
      complexityLevel: 'BASIC',
      urgencyLevel: 'ROUTINE',
      basePrice: 25,
      priceRangeMin: 20,
      priceRangeMax: 35,
      isHealthierSGCovered: true,
      medicalDescription: 'Follow-up consultation for ongoing treatment',
      patientFriendlyDesc: 'Return visit to see doctor',
      preparationSteps: ['Bring previous consultation notes'],
    },
    {
      name: 'Health Screening',
      category: 'PREVENTIVE_CARE',
      subcategory: 'Health Check-up',
      mohCode: 'PRE001',
      typicalDurationMin: 120,
      complexityLevel: 'MODERATE',
      urgencyLevel: 'ROUTINE',
      basePrice: 200,
      priceRangeMin: 150,
      priceRangeMax: 350,
      isHealthierSGCovered: true,
      medicalDescription: 'Comprehensive health screening including blood tests and physical examination',
      patientFriendlyDesc: 'Complete health check to detect potential health problems',
      preparationSteps: ['Fast for 8-12 hours', 'Bring previous medical records'],
    },
    {
      name: 'Cardiac Consultation',
      category: 'CARDIOLOGY',
      subcategory: 'Heart Specialist',
      mohCode: 'CAR001',
      typicalDurationMin: 45,
      complexityLevel: 'COMPLEX',
      urgencyLevel: 'ROUTINE',
      basePrice: 150,
      priceRangeMin: 120,
      priceRangeMax: 200,
      isHealthierSGCovered: false,
      medicalDescription: 'Specialist consultation for cardiovascular health',
      patientFriendlyDesc: 'Heart specialist consultation',
      preparationSteps: ['Bring ECG results', 'List heart medications'],
    },
    {
      name: 'ECG',
      category: 'DIAGNOSTICS',
      subcategory: 'Cardiac Diagnostics',
      mohCode: 'DIA001',
      typicalDurationMin: 20,
      complexityLevel: 'BASIC',
      urgencyLevel: 'ROUTINE',
      basePrice: 50,
      priceRangeMin: 40,
      priceRangeMax: 70,
      isHealthierSGCovered: true,
      medicalDescription: 'Electrocardiogram to assess heart rhythm and electrical activity',
      patientFriendlyDesc: 'Heart rhythm test',
      preparationSteps: ['Avoid caffeine before test', 'Wear comfortable clothing'],
    },
  ]

  // Create services
  for (const serviceData of services) {
    await prisma.Service.create({
      data: serviceData,
    })
  }

  // Link services to clinics
  const createdServices = await prisma.Service.findMany()
  for (const service of createdServices) {
    await prisma.ClinicService.create({
      data: {
        clinicId: clinic1.id,
        serviceId: service.id,
        isAvailable: true,
        clinicPrice: service.basePrice,
      },
    })

    if (service.category !== 'CARDIOLOGY') {
      await prisma.ClinicService.create({
        data: {
          clinicId: clinic2.id,
          serviceId: service.id,
          isAvailable: true,
          clinicPrice: service.basePrice * 1.1,
        },
      })
    }
  }

  console.log('✅ Database seeding completed successfully!')
  console.log(`Created: 1 admin user, 1 patient user, 2 clinics, ${createdServices.length} services`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
