import { useState, useCallback } from 'react'
import QRCode from 'qrcode'

export const useQRCode = (eventId: string) => {
    // State management
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [showQRCode, setShowQRCode] = useState(false)
    
      // Generate QR Code function
    const generateQRCode = useCallback(async () => {
        setIsGenerating(true)
        try {
        const formUrl = `${window.location.origin}/form/${eventId}`
        const qrCodeDataURL = await QRCode.toDataURL(formUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        })
        setQrCodeUrl(qrCodeDataURL) 
        setShowQRCode(true) 
        } catch (error) {
        console.error('Error generating QR code:', error)
        } finally {
        setIsGenerating(false) // Hide loading state
        }
    }, [eventId])
    // Hide QR Code function
    const hideQRCode = useCallback(() => {
        setShowQRCode(false)
      }, [])
    
    // Download QR Code function
    const downloadQRCode = useCallback((eventTitle: string) => {
        if (!qrCodeUrl) return // Safety check

        const link = document.createElement('a')
        link.download = `qr-code-${eventTitle.replace(/\s+/g, '-')}.png`
        link.href = qrCodeUrl
        link.click()
    }, [qrCodeUrl]) // Only recreate if qrCodeUrl changes

    // Copy QR Code URL function  // Copy URL function
    const copyURL = useCallback(() => {
        const formUrl = `${window.location.origin}/form/${eventId}`
        navigator.clipboard.writeText(formUrl)
    }, [eventId]) // Only recreate if eventId changes

    // Return everything components need
    return {
        qrCodeUrl,
        isGenerating,
        showQRCode,
        generateQRCode,
        hideQRCode,
        downloadQRCode,
        copyURL
    }
    }