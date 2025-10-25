import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingUsers() {
  console.log('🔄 Updating existing users...')
  
  try {
    // Update all users who don't have an onboarding status set
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { onboardingStatus: 'PENDING' },
          { role: null }
        ]
      },
      data: {
        onboardingStatus: 'COMPLETED',
        // Set default role for users without one
        role: 'HUNTER'
      }
    })
    
    console.log(`✅ Updated ${result.count} users to COMPLETED status`)
    
    // Show all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        address: true,
        name: true,
        role: true,
        onboardingStatus: true,
        createdAt: true
      }
    })
    
    console.log('\n📊 Current users:')
    console.table(users)
    
  } catch (error) {
    console.error('❌ Error updating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingUsers()
