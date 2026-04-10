#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any
from urllib.parse import quote
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from pypdf import PdfReader

DEFAULT_SOURCE_DIR = Path('/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE')
DEFAULT_OUTPUT = Path(__file__).resolve().parent / 'SeededCourse' / 'course-library-content.json'

DOC_META: dict[str, dict[str, Any]] = {
    'OhioNotaryCoursePacket.pdf': {
        'id': 'primary_packet',
        'title': 'Ohio Notary Course Packet',
        'category': 'core',
        'kind': 'pdf',
        'description': 'Primary packet and source-of-truth study guide for the Ohio notary course.',
        'recommendedUse': 'Use this first every day. Track your resume page here and treat it as the main source document.',
        'priority': 'primary',
        'tags': ['packet', 'core', 'exam'],
    },
    'Notary Course Notes.pdf': {
        'id': 'course_notes_pdf',
        'title': 'Notary Course Notes',
        'category': 'support',
        'kind': 'pdf',
        'description': 'Condensed notes from the course with high-frequency exam facts and reminders.',
        'recommendedUse': 'Use after the main packet when you want a faster review pass.',
        'priority': 'high',
        'tags': ['notes', 'condensed', 'review'],
    },
    'Ohio_Notary_Exam_Study_Guide_v2.docx': {
        'id': 'exam_study_guide_v2',
        'title': 'Ohio Notary Exam Study Guide v2',
        'category': 'support',
        'kind': 'docx',
        'description': 'Cleaned exam-ready study guide built from transcript content and organized for recall.',
        'recommendedUse': 'Use for fast review, memory aids, and weak-topic repair before quizzes.',
        'priority': 'high',
        'tags': ['study-guide', 'cleaned', 'exam-ready'],
    },
    'Notary course transcriptions.docx': {
        'id': 'transcriptions_docx',
        'title': 'Notary Course Transcriptions',
        'category': 'transcript',
        'kind': 'docx',
        'description': 'Transcript source file from course audio, useful when you want exact wording from the lectures.',
        'recommendedUse': 'Use as a reference source, not your first-pass study document.',
        'priority': 'reference',
        'tags': ['transcript', 'audio', 'reference'],
    },
    'Notary course transcriptions copy.docx': {
        'id': 'transcriptions_copy_docx',
        'title': 'Notary Course Transcriptions Copy',
        'category': 'transcript',
        'kind': 'docx',
        'description': 'Alternate transcript copy for cross-checking phrasing and missed details.',
        'recommendedUse': 'Use only when you need a backup transcript version.',
        'priority': 'reference',
        'tags': ['transcript', 'copy', 'reference'],
    },
    'Notary course transcriptions.pdf': {
        'id': 'transcriptions_pdf',
        'title': 'Notary Course Transcriptions PDF',
        'category': 'transcript',
        'kind': 'pdf',
        'description': 'PDF transcript export of the course audio content.',
        'recommendedUse': 'Use if you want a transcript in PDF form for search or citation.',
        'priority': 'reference',
        'tags': ['transcript', 'pdf', 'reference'],
    },
    'Notary course transcriptions (1).pdf': {
        'id': 'transcriptions_pdf_alt',
        'title': 'Notary Course Transcriptions PDF (Alt)',
        'category': 'transcript',
        'kind': 'pdf',
        'description': 'Alternate transcript PDF version of the course material.',
        'recommendedUse': 'Keep as a backup reference version.',
        'priority': 'reference',
        'tags': ['transcript', 'alternate', 'reference'],
    },
    'Notary course transcriptions copy.pdf': {
        'id': 'transcriptions_copy_pdf',
        'title': 'Notary Course Transcriptions Copy PDF',
        'category': 'transcript',
        'kind': 'pdf',
        'description': 'Copy version of the course transcript in PDF form.',
        'recommendedUse': 'Use only if you need another transcript copy for comparison.',
        'priority': 'reference',
        'tags': ['transcript', 'copy', 'reference'],
    },
    'columbus_ohio_notary_business_plan.docx': {
        'id': 'business_plan_docx',
        'title': 'Columbus Ohio Notary Business Plan',
        'category': 'business',
        'kind': 'docx',
        'description': 'Formal Columbus launch plan with market, operating, and financial strategy.',
        'recommendedUse': 'Use when working on roadmap, service lanes, pricing, and growth planning.',
        'priority': 'business',
        'tags': ['business-plan', 'columbus', 'roadmap'],
    },
    'ohio_notary_business_plan_financial_model.xlsx': {
        'id': 'business_plan_financial_model',
        'title': 'Ohio Notary Business Plan Financial Model',
        'category': 'business',
        'kind': 'xlsx',
        'description': 'Financial model for startup costs, revenue ramp, cash flow, and break-even planning.',
        'recommendedUse': 'Use when validating revenue lanes and monthly targets.',
        'priority': 'business',
        'tags': ['financial-model', 'forecast', 'break-even'],
    },
    'slides from notary course.pdf': {
        'id': 'course_slides_pdf',
        'title': 'Slides From Notary Course',
        'category': 'support',
        'kind': 'pdf',
        'description': 'Raw slide deck from the course, useful for checking slide wording and sequence.',
        'recommendedUse': 'Use as a visual reference when you want the original slide framing.',
        'priority': 'support',
        'tags': ['slides', 'visual', 'reference'],
    },
}


def size_label(size_bytes: int) -> str:
    value = float(size_bytes)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if value < 1024 or unit == 'GB':
            return f'{value:.1f} {unit}' if unit != 'B' else f'{int(value)} B'
        value /= 1024
    return f'{size_bytes} B'


def clean_lines(text: str, limit_lines: int = 18) -> str:
    lines = []
    for raw in text.splitlines():
        line = re.sub(r'\s+', ' ', raw).strip()
        if line:
            lines.append(line)
        if len(lines) >= limit_lines:
            break
    return '\n'.join(lines)


def extract_pdf_preview(path: Path, max_pages: int = 4) -> tuple[str, int | None]:
    reader = PdfReader(str(path))
    page_count = len(reader.pages)
    chunks: list[str] = []
    for i in range(min(max_pages, page_count)):
        try:
            chunks.append(reader.pages[i].extract_text() or '')
        except Exception:
            continue
    return clean_lines('\n'.join(chunks)), page_count


def extract_docx_preview(path: Path) -> str:
    with ZipFile(path) as archive:
        xml = archive.read('word/document.xml')
    root = ET.fromstring(xml)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = '\n'.join(''.join(node.text or '' for node in paragraph.iterfind('.//w:t', ns)) for paragraph in root.findall('.//w:p', ns))
    return clean_lines(text)


def extract_xlsx_preview(path: Path) -> str:
    ns_main = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    ns_rel = {'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    lines: list[str] = []
    with ZipFile(path) as archive:
        shared: list[str] = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            root = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            for si in root.findall('a:si', ns_main):
                shared.append(''.join(t.text or '' for t in si.iterfind('.//a:t', ns_main)))

        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in relationships}

        for sheet in workbook.findall('a:sheets/a:sheet', {**ns_main, **ns_rel}):
            sheet_name = sheet.attrib.get('name', 'Sheet')
            relationship_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            if not relationship_id:
                continue
            target = rel_map[relationship_id].lstrip('/')
            if not target.startswith('xl/'):
                target = f'xl/{target}'
            root = ET.fromstring(archive.read(target))
            row_count = 0
            lines.append(f'[{sheet_name}]')
            for row in root.findall('.//a:sheetData/a:row', ns_main):
                values: list[str] = []
                for cell in row.findall('a:c', ns_main):
                    value_node = cell.find('a:v', ns_main)
                    if value_node is None:
                        continue
                    value = value_node.text or ''
                    if cell.attrib.get('t') == 's' and value.isdigit():
                        index = int(value)
                        value = shared[index] if index < len(shared) else value
                    values.append(value)
                if values:
                    lines.append(' | '.join(values[:8]))
                    row_count += 1
                if row_count >= 10:
                    break
            if len(lines) >= 18:
                break
    return clean_lines('\n'.join(lines), limit_lines=18)


def audio_duration_seconds(path: Path) -> float | None:
    try:
        result = subprocess.run(
            ['mdls', '-name', 'kMDItemDurationSeconds', str(path)],
            check=True,
            capture_output=True,
            text=True,
        )
    except Exception:
        return None
    match = re.search(r'=\s*([0-9.]+)', result.stdout)
    return float(match.group(1)) if match else None


def duration_label(seconds: float | None) -> str | None:
    if seconds is None:
        return None
    total = int(round(seconds))
    hours, remainder = divmod(total, 3600)
    minutes, sec = divmod(remainder, 60)
    if hours:
        return f'{hours}h {minutes}m'
    if minutes:
        return f'{minutes}m {sec}s'
    return f'{sec}s'


def generic_meta(path: Path) -> dict[str, Any]:
    stem = path.stem.replace('_', ' ').replace('-', ' ').strip()
    title = ' '.join(word.capitalize() if word.islower() else word for word in stem.split())
    kind = path.suffix.lower().lstrip('.')
    category = 'audio' if kind == 'm4a' else 'support'
    return {
        'id': re.sub(r'[^a-z0-9]+', '_', stem.lower()).strip('_'),
        'title': title,
        'category': category,
        'kind': kind,
        'description': f'Supporting course asset: {path.name}',
        'recommendedUse': 'Use as a supporting reference inside the course library.',
        'priority': 'support',
        'tags': [kind or 'file'],
    }


def build_business_snapshot() -> dict[str, Any]:
    return {
        'startupCashOutlay': '$2,114',
        'year1Revenue': '$36,645',
        'year1EBITDA': '$20,538',
        'breakEvenMonthlyAppointments': '13 appointments / month',
        'recommendedCapitalTarget': '$7,500',
    }


def build_document_entry(path: Path, served_name: str, meta: dict[str, Any]) -> dict[str, Any]:
    suffix = path.suffix.lower()
    preview = ''
    page_count: int | None = None
    duration = None

    if suffix == '.pdf':
        preview, page_count = extract_pdf_preview(path)
    elif suffix == '.docx':
        preview = extract_docx_preview(path)
    elif suffix == '.xlsx':
        preview = extract_xlsx_preview(path)
    elif suffix == '.m4a':
        duration = audio_duration_seconds(path)

    return {
        'id': meta['id'],
        'title': meta['title'],
        'category': meta['category'],
        'kind': meta['kind'],
        'priority': meta['priority'],
        'description': meta['description'],
        'recommendedUse': meta['recommendedUse'],
        'tags': meta.get('tags', []),
        'sourceFileName': path.name,
        'servedFileName': served_name,
        'url': f'./CourseLibrary/{quote(served_name)}',
        'fileSizeBytes': path.stat().st_size,
        'fileSizeLabel': size_label(path.stat().st_size),
        'pageCount': page_count,
        'durationSeconds': duration,
        'durationLabel': duration_label(duration),
        'previewText': preview,
        'isPrimaryPacket': meta['id'] == 'primary_packet',
    }


def build_payload(source_dir: Path, primary_pdf: Path) -> dict[str, Any]:
    course_files: list[Path] = []
    if source_dir.exists():
        course_files.extend(sorted([path for path in source_dir.iterdir() if path.is_file() and not path.name.startswith('.')]))

    documents: list[dict[str, Any]] = []
    total_audio_seconds = 0.0

    primary_meta = DOC_META['OhioNotaryCoursePacket.pdf']
    documents.append(build_document_entry(primary_pdf, 'OhioNotaryCoursePacket.pdf', primary_meta))

    for path in course_files:
        if path.resolve() == primary_pdf.resolve():
            continue
        if path.name == 'Study Guide with PowerPoint Handouts-2.pdf':
            # Avoid duplicating the primary packet in the UI; it is already represented above.
            continue
        meta = DOC_META.get(path.name, generic_meta(path))
        entry = build_document_entry(path, path.name, meta)
        if entry['durationSeconds']:
            total_audio_seconds += float(entry['durationSeconds'])
        documents.append(entry)

    documents.sort(key=lambda item: (
        {'primary': 0, 'high': 1, 'support': 2, 'reference': 3, 'business': 4}.get(item['priority'], 5),
        {'core': 0, 'support': 1, 'transcript': 2, 'audio': 3, 'business': 4}.get(item['category'], 5),
        item['title'].lower(),
    ))

    return {
        'metadata': {
            'sourceDirectory': str(source_dir),
            'documentCount': len(documents),
            'audioFileCount': len([doc for doc in documents if doc['kind'] == 'm4a']),
            'totalAudioSeconds': total_audio_seconds,
            'privateUseOnly': True,
        },
        'businessSnapshot': build_business_snapshot(),
        'recommendedStudyStack': [
            'Ohio Notary Course Packet',
            'Notary Course Notes',
            'Ohio Notary Exam Study Guide v2',
            'Final cram sheet',
            'Weak-topic quiz loop',
        ],
        'documents': documents,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Build the private course-library manifest for the Mac app.')
    parser.add_argument('--source-dir', type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument('--primary-pdf', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    source_dir = args.source_dir.expanduser().resolve()
    primary_pdf = args.primary_pdf.expanduser().resolve()
    output = args.output.expanduser().resolve()

    if not primary_pdf.exists():
        raise SystemExit(f'Missing primary PDF: {primary_pdf}')

    output.parent.mkdir(parents=True, exist_ok=True)
    payload = build_payload(source_dir, primary_pdf)
    output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Wrote course library content to {output}')


if __name__ == '__main__':
    main()
