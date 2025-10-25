import { useAccount, useSignMessage, useChainId } from "wagmi"
import { SiweMessage } from "siwe"
import { signIn, signOut, useSession } from "next-auth/react"

export function useSIWE() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { data: session, status } = useSession()
  const chainId = useChainId()

  const handleSignIn = async () => {
    if (!isConnected || !address) {
      console.log("Not connected or no address")
      return
    }

    try {
      console.log("Starting SIWE flow...")
      
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to access the debug platform.",
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
        nonce: Math.random().toString(36).substring(2, 15),
      })

      const messageToSign = message.prepareMessage()
      console.log("Message to sign:", messageToSign)

      const signature = await signMessageAsync({
        message: messageToSign,
      })
      console.log("Signature received:", signature)

      // 🔥 NextAuth credentials provider call
      const result = await signIn("credentials", {
        message: messageToSign,
        signature,
        redirect: false, // stay on the same page
      })
      
      console.log("SignIn result:", result)
    } catch (err) {
      console.error("SIWE signIn error:", err)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
  }

  return {
    session,
    status, // "loading" | "authenticated" | "unauthenticated"
    handleSignIn,
    handleSignOut,
  }
}
