import Link from 'next/link';
import { ArrowRight, Globe, Zap, Shield } from 'lucide-react';

export default function Home() {
  const randomRoomId = Math.random().toString(36).substring(7);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-4xl w-full">
        <div className="mb-8 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-float">
          <Globe className="text-blue-400 w-8 h-8" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6 tracking-tight">
          Open World Chat
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl leading-relaxed">
          The anonymous, real-time communication layer for the open web.
          No sign-ups. No tracking. Just share a link and start talking.
        </p>

        <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
          <Link
            href={`/${randomRoomId}`}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Start a New Room
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-white/50 blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <div className="flex gap-4 text-sm text-white/40">
            <div className="flex items-center gap-1">
              <Zap size={16} className="text-yellow-400" /> Real-time
            </div>
            <div className="flex items-center gap-1">
              <Shield size={16} className="text-green-400" /> Anonymous
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
          {[
            { title: 'Instant Access', desc: 'Generate a unique link and invite anyone instantly.', icon: <Zap className="text-yellow-400" /> },
            { title: 'Rich Media', desc: 'Share images and documents seamlessly.', icon: <Globe className="text-blue-400" /> },
            { title: 'Ephemeral', desc: 'Chats are temporary and stored in-memory.', icon: <Shield className="text-green-400" /> },
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl text-left hover:bg-white/5 transition-colors">
              <div className="mb-4 p-2 bg-white/5 rounded-lg w-fit">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/50">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
