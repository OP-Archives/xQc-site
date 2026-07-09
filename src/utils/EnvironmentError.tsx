export default function EnvironmentError({ missingVars }: { missingVars: string[] }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark text-white p-8">
      <h4 className="text-2xl font-bold mb-4">Configuration Error</h4>
      <p className="text-gray-400 mb-4">
        The application cannot start because required environment variables are missing.
      </p>
      <div className="bg-black/30 p-2 rounded my-2 font-mono text-red-400 text-sm whitespace-pre-line">
        {missingVars.join('\n')}
      </div>
      <p className="text-gray-400 text-sm">Please ensure all required environment variables are set in your .env file.</p>
    </div>
  );
}
