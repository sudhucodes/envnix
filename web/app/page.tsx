import { getVersion } from '@/lib/get-version';
import Image from 'next/image';
import Link from 'next/link';

export default async function Page() {
    const version = await getVersion();

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 font-sans text-center">
            <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
                <div className="mb-6 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600">
                    <span className="size-2 rounded-full bg-green-500 mr-2"></span>v{version} is now
                    live
                </div>

                <Image
                    src="/logo.svg"
                    alt="Logo"
                    className="w-auto h-20 mb-4"
                    width={400}
                    height={400}
                />

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-500 md:text-xl">
                    A lightning-fast, production-ready Node.js CLI to generate{' '}
                    <code className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-sm text-neutral-800">
                        .env.example
                    </code>{' '}
                    files while flawlessly preserving your formatting and comments.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/docs"
                        className="group flex h-12 items-center justify-center rounded-full bg-neutral-950 px-8 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-neutral-800 hover:shadow-lg active:scale-95"
                    >
                        Read the Docs
                        <svg
                            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </Link>
                    <a
                        href="https://github.com/sudhucodes/envnix"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-8 text-sm font-medium text-neutral-700 transition-all hover:scale-105 hover:border-neutral-300 hover:bg-neutral-50 active:scale-95"
                    >
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        View on GitHub
                    </a>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[2rem_2rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-50"></div>
        </main>
    );
}
