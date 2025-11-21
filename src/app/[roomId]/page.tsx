import ChatRoom from '@/components/ChatRoom';

interface PageProps {
    params: {
        roomId: string;
    };
}

export default function RoomPage({ params }: PageProps) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full h-[85vh] md:h-[90vh]">
                <ChatRoom roomId={params.roomId} />
            </div>
        </main>
    );
}
