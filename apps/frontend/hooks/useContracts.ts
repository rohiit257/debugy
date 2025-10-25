import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES, BOUNTY_PLATFORM_ABI, BUG_BOUNTY_TOKEN_ABI } from '@/lib/contracts'

export function useContracts() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Hacker approval functions
  const approveHacker = async (hackerAddress: string, fundLimit: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.BOUNTY_PLATFORM as `0x${string}`,
      abi: BOUNTY_PLATFORM_ABI,
      functionName: 'approveHacker',
      args: [hackerAddress as `0x${string}`, parseEther(fundLimit)],
    })
  }

  const fundBountyAsHacker = async (bountyId: number, amount: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.BOUNTY_PLATFORM as `0x${string}`,
      abi: BOUNTY_PLATFORM_ABI,
      functionName: 'fundBountyAsHacker',
      args: [BigInt(bountyId), parseEther(amount)],
    })
  }

  const approvePerfectSubmission = async (submissionId: number, rewardAmount: string, tokenURI: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.BOUNTY_PLATFORM as `0x${string}`,
      abi: BOUNTY_PLATFORM_ABI,
      functionName: 'approvePerfectSubmission',
      args: [BigInt(submissionId), parseEther(rewardAmount), tokenURI],
    })
  }

  return {
    approveHacker,
    fundBountyAsHacker,
    approvePerfectSubmission,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook for reading hacker status
export function useHackerStatus(address?: string) {
  const { data: isApproved } = useReadContract({
    address: CONTRACT_ADDRESSES.BOUNTY_PLATFORM as `0x${string}`,
    abi: BOUNTY_PLATFORM_ABI,
    functionName: 'isHackerApproved',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: availableFunds } = useReadContract({
    address: CONTRACT_ADDRESSES.BOUNTY_PLATFORM as `0x${string}`,
    abi: BOUNTY_PLATFORM_ABI,
    functionName: 'getHackerAvailableFunds',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    isApproved: !!isApproved,
    availableFunds: availableFunds ? formatEther(availableFunds as bigint) : '0',
  }
}

// Hook for reading NFT tokens
export function useUserNFTs(address?: string) {
  const { data: tokenIds } = useReadContract({
    address: CONTRACT_ADDRESSES.BUG_BOUNTY_TOKEN as `0x${string}`,
    abi: BUG_BOUNTY_TOKEN_ABI,
    functionName: 'getTokensByOwner',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    tokenIds: tokenIds as bigint[] || [],
  }
}
