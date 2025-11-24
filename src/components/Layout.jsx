import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, BookOpen, Bot, RotateCcw, ExternalLink, Menu, X, Info } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import clsx from 'clsx';
import AboutModal from './AboutModal';

const SidebarItem = ({ icon: Icon, label, to, active, external }) => {
    const content = (
        <>
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
            {external && <ExternalLink size={14} className="ml-auto" />}
        </>
    );

    const className = clsx(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors mb-1",
        active
            ? "bg-hria-light text-white shadow-sm"
            : "text-gray-300 hover:bg-hria-light/50 hover:text-white"
    );

    if (external) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link to={to} className={className}>
            {content}
        </Link>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();
    const { currentAssessment } = useAssessment();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "w-64 bg-hria-dark flex flex-col text-white shrink-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">HRIA</h1>
                            <p className="text-[10px] text-gray-400 mt-0.5">ระบบประเมินผลกระทบด้านสิทธิมนุษยชน</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="แดชบอร์ดภาพรวม"
                            to="/"
                            active={location.pathname === '/'}
                        />
                        <SidebarItem
                            icon={FileText}
                            label="แบบประเมิน (Assessment)"
                            to="/assess/new"
                            active={location.pathname.startsWith('/assess')}
                        />
                        <SidebarItem
                            icon={Bot}
                            label="ที่ปรึกษา AI (AI Advisor)"
                            to="/advisor"
                            active={location.pathname === '/advisor'}
                        />
                        <SidebarItem
                            icon={BookOpen}
                            label="หลักการและกรอบงาน"
                            to="https://en-rights.softr.app/hria"
                            external={true}
                        />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <button
                            onClick={() => setIsAboutOpen(true)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-hria-light/50 hover:text-white"
                        >
                            <Info size={18} />
                            <span className="text-sm font-medium">เกี่ยวกับโครงการ</span>
                        </button>
                    </div>
                </div>


            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 w-full">
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="text-xs text-gray-500">
                            <span className="hidden sm:inline">แอปพลิเคชัน / </span>
                            <span className="text-gray-900 font-medium">
                                {location.pathname === '/' && 'แดชบอร์ด'}
                                {location.pathname.startsWith('/assess') && 'แบบประเมิน'}
                                {location.pathname === '/advisor' && 'ที่ปรึกษา AI'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {currentAssessment?.info?.name && (
                            <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 font-medium">
                                {currentAssessment.info.name}
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดและเริ่มต้นใหม่หรือไม่?')) {
                                    localStorage.removeItem('hria_assessments');
                                    window.location.href = '/';
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                        >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">รีเซ็ต</span>
                        </button>
                    </div>
                </header>
                <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>

            <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div>
    );
};

export default Layout;
