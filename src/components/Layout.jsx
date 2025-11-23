import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, BookOpen, Bot } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors mb-1",
            active
                ? "bg-eshria-light text-white shadow-sm"
                : "text-gray-300 hover:bg-eshria-light/50 hover:text-white"
        )}
    >
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

const Layout = ({ children }) => {
    const location = useLocation();
    const { currentAssessment } = useAssessment();

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-eshria-dark flex flex-col text-white shrink-0">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">ESHRIA</h1>
                            <p className="text-[10px] text-gray-400 mt-0.5">ระบบนำทางและประเมิน</p>
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
                            to="/framework"
                            active={location.pathname === '/framework'}
                        />
                    </nav>
                </div>

                <div className="mt-auto p-5 border-t border-white/10">
                    <div className="bg-white/5 p-3 rounded-lg text-[10px] text-gray-400 leading-relaxed">
                        อ้างอิงจากรายงานของผู้รายงานพิเศษแห่งสหประชาชาติ (UN Special Rapporteur) ว่าด้วยสิทธิมนุษยชนและสิ่งแวดล้อม
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50">
                <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <div className="text-xs text-gray-500">
                        แอปพลิเคชัน / <span className="text-gray-900 font-medium">
                            {location.pathname === '/' && 'แดชบอร์ด'}
                            {location.pathname.startsWith('/assess') && 'แบบประเมิน'}
                            {location.pathname === '/advisor' && 'ที่ปรึกษา AI'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {currentAssessment?.info?.name && (
                            <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 font-medium">
                                {currentAssessment.info.name}
                            </span>
                        )}
                    </div>
                </header>
                <div className="p-6 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
