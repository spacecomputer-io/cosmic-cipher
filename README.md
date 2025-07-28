# Orbitport Password Generator

A modern, space-themed password generator built with Next.js, TypeScript, and Tailwind CSS. This application uses the Orbitport API for cosmic true random number generation (cTRNG) to create high-entropy passwords.

## Features

- 🌌 **Space-themed UI** with glassmorphism effects and glowing animations
- 🔐 **Secure password generation** using Orbitport's cTRNG API
- ⚙️ **Customizable parameters**:
  - Password length (8-32 characters)
  - Minimum uppercase letters
  - Minimum lowercase letters
  - Minimum numbers
  - Minimum symbols
- 📋 **One-click copy** functionality
- 🔍 **Transparency** - view the random seed used for generation
- 🛡️ **Fallback system** - uses local crypto if API is unavailable
- 📱 **Responsive design** - works on all devices
- ♿ **Accessible** - follows WCAG guidelines

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Random Generation**: Orbitport cTRNG API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Orbitport API key (optional, fallback available)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd password-generator
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env.local file
cp .env.example .env.local
```

4. Add your Orbitport credentials to `.env.local`:

```env
ORBITPORT_API_URL=https://api.orbitport.io
ORBITPORT_CLIENT_ID=your_client_id_here
ORBITPORT_CLIENT_SECRET=your_client_secret_here
ORBITPORT_AUTH_URL=https://api.orbitport.io/oauth/token
```

> **Note**: The app will work without Orbitport credentials using fallback random generation, but for true cosmic randomness, get your credentials from [Orbitport](https://orbitport.io).

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configure Password Settings**:

   - Use the slider to set password length (8-32 characters)
   - Set minimum requirements for each character type
   - Ensure total minimums don't exceed password length

2. **Generate Password**:

   - Click "Generate Password" button
   - Wait for the API call to complete
   - View your generated password

3. **Copy and View**:
   - Click the copy button to copy the password to clipboard
   - Use "View Seed" dropdown to see the random seed used

## API Integration

The app integrates with the Orbitport cTRNG API:

- **Endpoint**: `https://api.orbitport.io/api/v1/services/trng`
- **Method**: GET
- **Authentication**: OAuth 2.0 Client Credentials
- **Response**: 256-bit hex seed

### Fallback System

If the Orbitport API is unavailable (rate limit, auth error, network issue), the app automatically falls back to using Node.js `crypto.randomBytes()` with a warning message.

## Password Generation Algorithm

1. **Fetch Seed**: Get 256-bit random seed from Orbitport API
2. **Validate Requirements**: Ensure minimum character requirements are met
3. **Generate Password**:
   - Add minimum required characters from each charset
   - Fill remaining length with random characters
   - Shuffle the final password
4. **Return Result**: Password and seed for transparency

### Character Sets

- **Uppercase**: A-Z (excluding O for clarity)
- **Lowercase**: a-z (excluding l for clarity)
- **Numbers**: 2-9 (excluding 0 and 1 for clarity)
- **Symbols**: !@#$%^&\*+-=

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable                  | Description            | Required | Default                  |
| ------------------------- | ---------------------- | -------- | ------------------------ |
| `ORBITPORT_API_URL`       | Orbitport API base URL | No       | Fallback to local crypto |
| `ORBITPORT_CLIENT_ID`     | OAuth client ID        | No       | Fallback to local crypto |
| `ORBITPORT_CLIENT_SECRET` | OAuth client secret    | No       | Fallback to local crypto |
| `ORBITPORT_AUTH_URL`      | OAuth token endpoint   | No       | Fallback to local crypto |

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Password generation API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   └── ui/                       # shadcn/ui components
└── lib/
    └── utils.ts                  # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Security Considerations

- ✅ Passwords are never stored or logged
- ✅ Seeds are only displayed for transparency
- ✅ Input validation prevents injection attacks
- ✅ HTTPS required for all API calls
- ✅ Rate limiting handled gracefully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Orbitport](https://orbitport.io) for cosmic true random number generation
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Lucide](https://lucide.dev) for icons
- [Tailwind CSS](https://tailwindcss.com) for styling
