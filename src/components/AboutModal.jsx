import React from 'react';
import { X, Shield, Cpu, Lightbulb, Users, Rocket } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-hria-dark p-6 text-white flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">About Us</span>
                            <span className="bg-green-500/80 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Beta</span>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight">ยกระดับมาตรฐานสิทธิมนุษยชนด้วยนวัตกรรมและเทคโนโลยี</h2>
                        <p className="text-gray-300 text-sm mt-2 font-light">
                            Human Rights Innovation Lab พื้นที่แห่งการเรียนรู้ ทดลอง และสร้างสรรค์ทางออก เพื่อสังคมที่เป็นธรรมและเคารพสิทธิมนุษยชน
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        {/* Intro Section */}
                        <section className="prose prose-sm max-w-none text-gray-600">
                            <p className="text-lg leading-relaxed text-gray-700">
                                ยินดีต้อนรับสู่ <span className="font-bold text-hria-dark">Human Rights Innovation Lab</span> ห้องปฏิบัติการทางความคิดที่เราเชื่อว่า
                                "ความคิดสร้างสรรค์" คืออาวุธที่ทรงพลังที่สุดในการต่อสู้เพื่อสิทธิมนุษยชนและความยุติธรรม
                            </p>
                            <p>
                                เราคือพื้นที่ทดลอง (Sandbox) สำหรับไอเดียใหม่ๆ ไม่ว่าจะเป็นการใช้ AI ส่งเสริมและคุ้มครองสิทธิมนุษยชน
                                หรือการสร้างแพลตฟอร์มมีส่วนร่วมของพลเมือง เราเปิดโอกาสให้ทุกคนกล้าที่จะ
                                <span className="font-bold text-hria-dark mx-1">ล้มเหลว เรียนรู้ และลุกขึ้นสร้างสิ่งใหม่</span>
                                (Fail Fast, Learn Faster)
                            </p>
                        </section>

                        {/* What We Do */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3 mb-2 text-blue-800 font-bold">
                                    <Users size={20} />
                                    <h3>Connect</h3>
                                </div>
                                <p className="text-sm text-blue-700">พื้นที่ปล่อยของสำหรับ Tech Activist และ Human Rights Defender</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <div className="flex items-center gap-3 mb-2 text-purple-800 font-bold">
                                    <Rocket size={20} />
                                    <h3>Scale</h3>
                                </div>
                                <p className="text-sm text-purple-700">ขยายผลนวัตกรรมต้นแบบไปสู่การใช้งานจริง</p>
                            </div>
                        </section>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* AI Transparency & Ethics */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Cpu className="text-green-600" />
                                ความโปร่งใสและจริยธรรม (Transparency & Ethics)
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <Lightbulb size={16} className="text-yellow-600" />
                                        ความโปร่งใสของอัลกอริทึม (Algorithm Transparency)
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-1">
                                        <li>ระบบนี้ใช้ <strong>Large Language Model (LLM)</strong> ในการวิเคราะห์เอกสาร โดยทำงานบนหลักการ <strong>"Evidence-Based Analysis"</strong></li>
                                        <li>AI จะวิเคราะห์ <strong>เฉพาะข้อมูลที่ปรากฏในเอกสาร</strong> เท่านั้น ไม่มีการนำข้อมูลภายนอกมาปะปน หรือ "มโน" (Hallucination) ขึ้นเอง</li>
                                        <li>ทุกข้อค้นพบ (ความเสี่ยง/ผลกระทบ) จะมีการอ้างอิงกลับไปยังส่วนของเอกสารต้นฉบับ (Citation) เสมอ เพื่อให้ผู้ใช้งานตรวจสอบความถูกต้องได้</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <Shield size={16} className="text-green-600" />
                                        จริยธรรม AI (AI Ethics)
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-1">
                                        <li><strong>Human-in-the-Loop:</strong> AI ทำหน้าที่เป็นเพียง "ผู้ช่วย" (Assistant) ในการประมวลผลและตั้งข้อสังเกต การตัดสินใจขั้นสุดท้ายยังคงเป็นดุลยพินิจของผู้เชี่ยวชาญที่เป็นมนุษย์</li>
                                        <li><strong>Privacy First:</strong> ข้อมูลเอกสารที่อัปโหลดจะถูกประมวลผลเพื่อการวิเคราะห์เท่านั้น และไม่ได้ถูกนำไปใช้เทรนโมเดลสาธารณะ</li>
                                        <li><strong>Bias Awareness:</strong> เราตระหนักถึงอคติที่อาจแฝงมากับโมเดลภาษา จึงมีการออกแบบ Prompt เพื่อให้ AI วิเคราะห์ตามหลักการสิทธิมนุษยชนสากล (UNGP) อย่างเป็นกลางที่สุด</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-xs text-gray-400">
                    © 2024 Human Rights Innovation Lab. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
