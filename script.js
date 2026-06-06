// Add Subject
const addSubject = document.getElementById('add-subject')
const nextId = 0;
addSubject.addEventListener("click", function(){
    const table = document.getElementById('table')
    const subjectRow = document.createElement('tr')
    subjectRow.classList.add('subject-row')
    const nextId = table.querySelectorAll('.subject-row').length + 1

    subjectRow.innerHTML = 
    `
    <td><input type="text" class="subject-title" placeholder="Subject #${nextId}"></td>
    <td><input type="number" id="unit-${nextId}" name="unit"></td>
    <td><input type="number" id="grade-${nextId}" name="grade"></td>
    <td><button class="remove-subject"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td>
    `

    table.appendChild(subjectRow)
    renumberSubjects()
})

// Renumber subjects when rows are removed
function renumberSubjects() {
    const rows = Array.from(document.querySelectorAll('.subject-row'))
    rows.forEach((row, index) => {
        const subjectInput = row.querySelector('.subject-title')
        if (!subjectInput) return

        const currentValue = subjectInput.value.trim()
        if (currentValue === '' || /^Subject #\d+$/.test(currentValue)) {
            subjectInput.placeholder = `Subject #${index + 1}`
        }
    })
}

// Calculate GWA
const calculateGWA = document.getElementById('calculate-gwa')
calculateGWA.addEventListener("click", function(){
    const subjectRows = document.querySelectorAll('.subject-row')
    let sumWeightedGrades = 0
    let sumUnits = 0

    subjectRows.forEach(row => {
        const subjectGradeInput = row.querySelector('input[name="grade"]')
        const subjectUnitInput = row.querySelector('input[name="unit"]')
        const subjectGrade = subjectGradeInput?.valueAsNumber || 0
        const subjectUnit = subjectUnitInput?.valueAsNumber || 0

        if (!subjectGrade || !subjectUnit) return

        sumWeightedGrades += subjectGrade * subjectUnit
        sumUnits += subjectUnit
    })

    if (!sumUnits) {
        alert('Please enter at least one unit and grade.')
        return
    }

    const gwa = sumWeightedGrades / sumUnits

    const container = document.querySelector('.info')
    const existingResult = document.querySelector('.gwa-result')
    if (existingResult) {container.removeChild(existingResult)} 
    const result = document.createElement('div')
    result.classList.add('gwa-result')
    result.innerHTML = `
        <div style="width: 100%; height: 2px; background-color: #e0e0e0; margin: 2px 0 14px 0;"></div>
        <p class="header" style="margin: 16px 0; font-weight: 700;">Result</p>
        <div class="gwa-content">
            <p style="color:#f5f5f5">General Weighted Average</p>
            <h1 id="gwa" style="font-size: 48px;">${gwa.toFixed(2)}</h1>
            <div style="display: flex; align-items:center; gap:4px; color:#f0f0f0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-equal-approximately-icon lucide-equal-approximately"><path d="M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0"/><path d="M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0"/></svg>
                <p style="font-size:14px">${gwa.toFixed(4)}</p>
            </div>
            
        </div>
    `
    container.appendChild(result)
    
})

// Remove row
const table = document.getElementById('table')
table?.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-subject')
    if (!removeButton) return

    const row = removeButton.closest('tr')
    if (row) {
        row.remove()
        renumberSubjects()
    }
})

const scanButton = document.getElementById('scan-portal-grade')
const imageInput = document.getElementById('grade-image')
const ocrResult = document.getElementById('ocr-result')
const dropZone = document.querySelector('.upload-photo')

const setSelectedImage = file => {
    if (!file || !file.type.startsWith('image/')) {
        ocrResult.textContent = 'Please drop an image file (JPG, PNG, WEBP).'
        ocrResult.className =  'ocr-result error-modal'
        ocrResult.style.display = 'flex';
        return
    }

    const dt = new DataTransfer()
    dt.items.add(file)
    imageInput.files = dt.files
    ocrResult.textContent = `Selected image: ${file.name}`
    ocrResult.className =  'ocr-result info-modal'
    ocrResult.style.display = 'flex';
}

const resetDropStyle = () => {
    if (!dropZone) return
    dropZone.style.border = ''
    dropZone.style.backgroundColor = ''
}

dropZone?.addEventListener('dragover', event => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    dropZone.style.border = '2px dashed #5EB761'
    dropZone.style.backgroundColor = '#e7f4e8'
})

dropZone?.addEventListener('dragleave', () => {
    resetDropStyle()
})

dropZone?.addEventListener('drop', event => {
    event.preventDefault()
    resetDropStyle()
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    setSelectedImage(file)
})

imageInput?.addEventListener('click', () => {
    imageInput.value = ''
})

imageInput?.addEventListener('change', event => {
    const file = event.target.files?.[0]
    if (file) {
        ocrResult.textContent = `Selected image: ${file.name}`
        ocrResult.className =  'ocr-result info-modal'
        ocrResult.style.display = 'flex';
    }
})

const normalizeLine = line => line.replace(/\s+/g, ' ').trim()
const isGradeToken = token => /^[0-9]+(?:\.[0-9]{1,2})?$/.test(token)
const isUnitToken = token => /^[1-6]$/.test(token)

function normalizeGradeToken(token) {
    if (/^[1-5](?:\.[0-9]{1,2})?$/.test(token)) {
        return token
    }
    if (/^[1-5][0-9]{2}$/.test(token)) {
        return `${token[0]}.${token.slice(1)}`
    }
    return null
}

function parseOCRText(text) {
    return text
        .split(/\r?\n/)
        .map(line => normalizeLine(line))
        .filter(line => line.length > 0)
        .map(line => {
            const tokens = line.split(/\s+/)
            for (let i = tokens.length - 1; i >= 0; i -= 1) {
                const grade = normalizeGradeToken(tokens[i])
                if (!grade) continue

                for (let j = i - 1; j >= 0; j -= 1) {
                    const unit = tokens[j]
                    if (!isUnitToken(unit)) continue
                    const unitValue = Number(unit)
                    if (unitValue > 0 && unitValue < 10) {
                        return { units: unit, grade }
                    }
                }
            }
            return null
        })
        .filter(Boolean)
}

const ensureSubjectRows = count => {
    const table = document.getElementById('table')
    let rows = Array.from(table.querySelectorAll('.subject-row'))
    while (rows.length < count) {
        addSubject.click()
        rows = Array.from(table.querySelectorAll('.subject-row'))
    }
    return rows
}

const fillInputsFromOCR = rows => {
    ocrResult.innerHTML = ''
    if (!rows.length) {
        ocrResult.textContent = 'No unit/grade rows were found in that image.'
        ocrResult.className =  'ocr-result error-modal'
        ocrResult.style.display = 'flex';
        return
    }

    const rowsToFill = ensureSubjectRows(rows.length)
    rows.forEach((row, index) => {
        const rowEl = rowsToFill[index]
        if (!rowEl) return

        const unitInput = rowEl.querySelector('input[name="unit"]')
        const gradeInput = rowEl.querySelector('input[name="grade"]')

        if (unitInput) unitInput.value = row.units
        if (gradeInput) gradeInput.value = row.grade
    })

    ocrResult.textContent = `${rows.length} unit/grade row(s) loaded.`
    ocrResult.className =  'ocr-result success-modal'
    ocrResult.style.display = 'flex';
    return
}

scanButton?.addEventListener('click', async () => {
    const file = imageInput?.files?.[0]
    if (!file) {
        ocrResult.textContent = 'Please upload a screenshot of your portal grade first.'
        ocrResult.className =  'ocr-result error-modal'
        ocrResult.style.display = 'flex';
        return
    }

    ocrResult.textContent = 'Scanning image...'
    ocrResult.className =  'ocr-result info-modal'
    ocrResult.style.display = 'flex';
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m)
        })
        console.log('Raw OCR text:', text)
        const rows = parseOCRText(text)
        console.log('Parsed rows:', rows)
        
        fillInputsFromOCR(rows)

    } catch (error) {
        console.error('OCR Error:', error)
        ocrResult.textContent = 'OCR failed. Check the browser console for details.'
    }
})