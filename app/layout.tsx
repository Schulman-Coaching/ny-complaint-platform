export const metadata = {
  title: 'NY Complaint Platform',
  description: 'AI-powered platform for preparing New York verified complaints',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
