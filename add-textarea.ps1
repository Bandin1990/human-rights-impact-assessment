# Create backup
Copy-Item 'src\pages\AssessmentForm.jsx' 'src\pages\AssessmentForm.jsx.backup'

# Read file
 = Get-Content 'src\pages\AssessmentForm.jsx' -Raw

# Find the position to insert (before the bg-blue-50 div)
 = '                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-700 text-xs border border-blue-100">'

 = @'
                        </div>
                        
                        {/* Manual content input */}
                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                หรือพิมพเนื้อหาสำคัจากเอกสาร (ถ้าไฟลอ่านไม่ได้)
                                <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-gray-50 text-sm"
                                rows={6}
                                placeholder="ระบุเนื้อหาสำคัจากเอกสาร เช่น:&#10;- วัตถุประสงคของครงการ/กหมาย&#10;- กลุ่มเป้าหมายหรือผ้ได้รับผลกระทบ&#10;- มาตรการสำคัที่จะดำเนินการ&#10;- ประเดนที่น่ากังวล&#10;- ข้อมลอื่นๆ ที่เกี่ยวข้อง"
                                value={currentAssessment.info.description || ''}
                                onChange={(e) => updateAssessmentInfo({ description: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                💡 เคลดลับ: ถ้า PDF อ่านไม่ได้ (เปนรปภาพ) ให้พิมพเนื้อหาสำคัลงในช่องนี้ AI จะนำไปวิเคราะหแทน
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-700 text-xs border border-blue-100">
'@

# Replace
 =  -replace [regex]::Escape(), 

# Write back
 | Set-Content 'src\pages\AssessmentForm.jsx' -NoNewline

Write-Host "Done! Backup saved to AssessmentForm.jsx.backup"
