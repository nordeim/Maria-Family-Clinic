// Database connection and configuration for Prisma
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utilities
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

export async function disconnectFromDatabase() {
  await prisma.$disconnect()
  console.log('✅ Database disconnected')
}

// PostGIS utilities
export async function enablePostGIS() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`
    console.log('✅ PostGIS extension enabled')
    return true
  } catch (error) {
    console.error('❌ Failed to enable PostGIS:', error)
    return false
  }
}

export async function createSpatialIndexes() {
  try {
    // Create spatial index for clinics location
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS clinic_location_gist ON clinics USING GIST (location)`
    console.log('✅ Spatial indexes created')
    return true
  } catch (error) {
    console.error('❌ Failed to create spatial indexes:', error)
    return false
  }
}

export async function testDatabaseConnection() {
  try {
    await connectToDatabase()
    
    // Test PostGIS functionality
    await enablePostGIS()
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version(), current_database()`
    console.log('Database version:', result)
    
    return true
  } catch (error) {
    console.error('Database test failed:', error)
    return false
  }
}