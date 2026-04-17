#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile

DEFAULT_XLSX = Path('/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/ohio_notary_business_plan_financial_model.xlsx')
DEFAULT_DOCX = Path('/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/columbus_ohio_notary_business_plan.docx')
DEFAULT_FINANCE_OUTPUT = Path(__file__).resolve().parent / 'SeededCourse' / 'finance-model-content.json'
DEFAULT_BUSINESS_PLAN_OUTPUT = Path(__file__).resolve().parent / 'SeededCourse' / 'business-plan-content.json'

NS_MAIN = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
NS_REL = {'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
NS_WORD = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

STRATEGY_MODE = 'aggressive_scale'

STARTUP_TIMING_MAP = {
    'Ohio notary education/testing': ('file_now', 'Commission filing'),
    'Ohio commission filing': ('file_now', 'Commission filing'),
    'BCI background check': ('file_now', 'Commission filing'),
    'Seal, journal, supplies': ('before_first_paid_appointment', 'In-person launch'),
    'Ohio LLC filing': ('before_mobile_launch', 'Mobile launch setup'),
    'Website / domain / brand setup': ('before_mobile_launch', 'Mobile launch setup'),
    'Phone / scheduling / software setup': ('before_mobile_launch', 'Mobile launch setup'),
    'E&O insurance': ('before_first_paid_appointment', 'Risk protection'),
    'RON education/testing': ('before_ron_launch', 'RON launch'),
    'RON filing': ('before_ron_launch', 'RON launch'),
    'E-seal / digital certificate / RON setup': ('before_ron_launch', 'RON launch'),
    'Printer / scanner / signing supplies': ('before_signing_agent_launch', 'Loan signing launch'),
}

FIXED_TIMING_MAP = {
    'Software / scheduling / cloud': ('before_mobile_launch', 'Mobile launch setup'),
    'Phone / connectivity': ('before_mobile_launch', 'Mobile launch setup'),
    'Insurance': ('before_first_paid_appointment', 'Risk protection'),
    'Marketing / reviews / local SEO': ('before_mobile_launch', 'Client acquisition'),
    'Office / admin / supplies': ('before_first_paid_appointment', 'Office/admin support'),
    'App workflow tools / automations': ('growth_optional', 'Automation and scale'),
    'Contingency / misc.': ('growth_optional', 'Reserve'),
}

LANE_META = {
    'employer_in_office': {
        'label': 'Employer / in-office',
        'sourceType': 'doc_plan',
        'avgRevenuePerAppointment': 15,
        'variableCostPerAppointment': 3,
        'launchMonth': 0,
        'profitPriority': 'low-risk reps first',
        'unlockRequirements': ['Commission approved', 'Oath completed', 'Seal received'],
        'phaseId': 'foundation',
        'roadmapLaneIds': ['employer_in_office'],
        'studyModuleLinks': ['identity-and-appearance-rules', 'acknowledgments', 'jurats-affidavits-oaths-affirmations'],
        'classification': 'foundation_cash',
        'bestFor': 'practice volume, clean reps, and referral confidence',
        'notes': 'Proxy lane not modeled as a standalone sheet line. Use it for low-risk repetitions and internal referrals, not as the long-term profit engine.',
    },
    'mobile_general': {
        'label': 'Mobile general',
        'sheetLabel': 'General mobile notary',
        'sourceType': 'spreadsheet_model',
        'launchMonth': 1,
        'profitPriority': 'fastest cash',
        'unlockRequirements': ['Commission approved', 'Oath completed', 'Seal received', 'Travel fee policy set'],
        'phaseId': 'local_mobile_launch',
        'roadmapLaneIds': ['mobile_general', 'same_day_after_hours'],
        'studyModuleLinks': ['acknowledgments', 'jurats-affidavits-oaths-affirmations', 'identity-and-appearance-rules'],
        'classification': 'fast_cash',
        'bestFor': 'fastest lawful local cash flow after commissioning',
        'notes': 'Use this lane to validate real demand and refine route efficiency before heavier specialty spend.',
    },
    'specialty_mobile': {
        'label': 'Specialty mobile',
        'sheetLabel': 'Specialty mobile (hospital/title/estate)',
        'sourceType': 'spreadsheet_model',
        'launchMonth': 1,
        'profitPriority': 'best early margin',
        'unlockRequirements': ['Clean mobile reps', 'Specialty checklists ready', 'Refusal logic documented'],
        'phaseId': 'specialty_niche_expansion',
        'roadmapLaneIds': ['hospital_hospice_nursing_home', 'vehicle_title_auto'],
        'studyModuleLinks': ['jurats-affidavits-oaths-affirmations', 'vehicle-title-notarization', 'identity-and-appearance-rules'],
        'classification': 'high_margin',
        'bestFor': 'urgent bedside/title/estate appointments with higher contribution per visit',
        'notes': 'Highest early-stage margin lane before loan signings. Activate only after you trust your screening and refusal SOPs.',
    },
    'ron': {
        'label': 'RON',
        'sheetLabel': 'Remote online notarization (RON)',
        'sourceType': 'spreadsheet_model',
        'launchMonth': 4,
        'profitPriority': 'best scale lane',
        'unlockRequirements': ['Commission active', 'Separate Ohio RON authorization', 'RON platform + e-seal + recording workflow'],
        'phaseId': 'digital_scale',
        'roadmapLaneIds': ['ron'],
        'studyModuleLinks': ['electronic-notarizations-vs-ron', 'ron-core-rules'],
        'classification': 'scale_lane',
        'bestFor': 'margin protection by removing drive time and increasing scheduling flexibility',
        'notes': 'Scales best once the in-person workflow is stable and the Ohio RON authorization is active.',
    },
    'loan_signing': {
        'label': 'Loan signing',
        'sheetLabel': 'Loan signing',
        'sourceType': 'spreadsheet_model',
        'launchMonth': 6,
        'profitPriority': 'highest margin later',
        'unlockRequirements': ['Printer/scanner ready', 'Signing package workflow', 'Title/escrow discipline'],
        'phaseId': 'premium_services',
        'roadmapLaneIds': ['notary_signing_agent'],
        'studyModuleLinks': ['acknowledgments', 'jurats-affidavits-oaths-affirmations', 'identity-and-appearance-rules'],
        'classification': 'premium_lane',
        'bestFor': 'highest contribution per appointment after premium workflow setup',
        'notes': 'Highest modeled contribution per appointment, but do not unlock it before equipment, package discipline, and return-shipping workflow are ready.',
    },
    'recurring_b2b': {
        'label': 'Recurring B2B',
        'sheetLabel': 'Recurring B2B visit',
        'sourceType': 'spreadsheet_model',
        'launchMonth': 7,
        'profitPriority': 'most stable revenue',
        'unlockRequirements': ['Repeatable pricing', 'Account package', 'Client management process'],
        'phaseId': 'recurring_accounts',
        'roadmapLaneIds': [],
        'studyModuleLinks': ['identity-and-appearance-rules', 'acknowledgments'],
        'classification': 'stability_lane',
        'bestFor': 'stable repeat revenue and lower dependence on one-off bookings',
        'notes': 'Best long-term stabilizer once the lane package, retention follow-up, and invoicing process are standardized.',
    },
}

OFFICIAL_RULES = [
    {
        'id': 'traditional_fee_cap',
        'label': 'Traditional act fee cap',
        'value': 5,
        'unit': '$/act',
        'sourceLabel': 'Ohio Revised Code 147.08',
        'sourceUrl': 'https://codes.ohio.gov/orc/147.08',
        'notes': 'Up to $5 for any notarial act that is not an online notarization. Effective April 3, 2025.',
    },
    {
        'id': 'ron_fee_cap',
        'label': 'RON act fee cap',
        'value': 30,
        'unit': '$/act',
        'sourceLabel': 'Ohio Revised Code 147.08',
        'sourceUrl': 'https://codes.ohio.gov/orc/147.08',
        'notes': 'Online notarizations may be charged up to $30 per notarial act.',
    },
    {
        'id': 'ron_tech_fee_cap',
        'label': 'RON technology fee cap',
        'value': 10,
        'unit': '$/session',
        'sourceLabel': 'Ohio Revised Code 147.08',
        'sourceUrl': 'https://codes.ohio.gov/orc/147.08',
        'notes': 'A technology fee up to $10 may be charged for the online notarization system per session.',
    },
    {
        'id': 'travel_fee_rule',
        'label': 'Travel fee rule',
        'value': 'Reasonable travel fee allowed',
        'unit': 'rule',
        'sourceLabel': 'Ohio Revised Code 147.08',
        'sourceUrl': 'https://codes.ohio.gov/orc/147.08',
        'notes': 'Travel must be agreed to in advance and is not charged per signature.',
    },
    {
        'id': 'application_upload_set',
        'label': 'Application upload set',
        'value': 'Signature sample, BCI report, education/testing certificate',
        'unit': 'requirements',
        'sourceLabel': 'Ohio Secretary of State application requirements',
        'sourceUrl': 'https://www.ohiosos.gov/notary/application-requirements/',
        'notes': 'These are the core upload requirements for filing the Ohio commission application.',
    },
    {
        'id': 'education_testing_currency',
        'label': 'Education/testing proof window',
        'value': 12,
        'unit': 'months',
        'sourceLabel': 'Ohio Secretary of State education/testing information',
        'sourceUrl': 'https://www.ohiosos.gov/notary/education-and-testing/',
        'notes': 'Education must be completed no later than 12 months before the application date.',
    },
    {
        'id': 'bci_background_fee',
        'label': 'BCI background check fee',
        'value': 22,
        'unit': '$',
        'sourceLabel': 'Ohio BCI civilian background check procedures',
        'sourceUrl': 'https://www.ohioattorneygeneral.gov/Files/Publications-Files/Background-Check-Publications/BCI-Civilian-Background-Check-Procedures-PDF',
        'notes': 'Required for filing but not included in the spreadsheet startup total.',
    },
    {
        'id': 'ohio_llc_articles_fee',
        'label': 'Ohio LLC Articles of Organization fee',
        'value': 99,
        'unit': '$',
        'sourceLabel': 'Ohio Secretary of State filing forms and fee schedule',
        'sourceUrl': 'https://www.ohiosos.gov/businesses/filing-forms--fee-schedule/',
        'notes': 'Matches the business-plan spreadsheet LLC filing assumption.',
    },
]


@dataclass
class WorkbookData:
    sheets: dict[str, dict[int, dict[str, str]]]


def money(value: float | int | str) -> str:
    if isinstance(value, str):
        return value
    return f'${value:,.0f}' if float(value).is_integer() else f'${value:,.2f}'


def pct(value: float) -> str:
    return f'{value * 100:.0f}%'


def parse_money(value: str | float | int | None) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace('$', '').replace(',', '').strip()
    if not cleaned:
        return 0.0
    return float(cleaned)


def slug(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', value.lower()).strip('_')


def load_docx_paragraphs(path: Path) -> list[str]:
    with ZipFile(path) as archive:
        xml = archive.read('word/document.xml')
    root = ET.fromstring(xml)
    paragraphs: list[str] = []
    for paragraph in root.findall('.//w:p', NS_WORD):
        text = ''.join(node.text or '' for node in paragraph.iterfind('.//w:t', NS_WORD)).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def workbook_sheet_map(path: Path) -> WorkbookData:
    with ZipFile(path) as archive:
        shared_strings: list[str] = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            root = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            for si in root.findall('a:si', NS_MAIN):
                shared_strings.append(''.join(node.text or '' for node in si.iterfind('.//a:t', NS_MAIN)))

        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        rels = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in rels}
        sheets: dict[str, dict[int, dict[str, str]]] = {}

        for sheet in workbook.findall('a:sheets/a:sheet', {**NS_MAIN, **NS_REL}):
            name = sheet.attrib.get('name', 'Sheet')
            rel_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            if not rel_id:
                continue
            target = rel_map[rel_id].lstrip('/')
            if not target.startswith('xl/'):
                target = f'xl/{target}'
            root = ET.fromstring(archive.read(target))
            row_map: dict[int, dict[str, str]] = {}
            for row in root.findall('.//a:sheetData/a:row', NS_MAIN):
                row_idx = int(row.attrib.get('r', '0') or '0')
                row_cells: dict[str, str] = {}
                for cell in row.findall('a:c', NS_MAIN):
                    ref = cell.attrib.get('r', '')
                    col = re.sub(r'\d+', '', ref)
                    value = None
                    if cell.attrib.get('t') == 'inlineStr':
                        value = ''.join(node.text or '' for node in cell.iterfind('.//a:t', NS_MAIN))
                    else:
                        v = cell.find('a:v', NS_MAIN)
                        if v is not None:
                            value = v.text or ''
                            if cell.attrib.get('t') == 's' and value.isdigit():
                                idx = int(value)
                                value = shared_strings[idx] if idx < len(shared_strings) else value
                    if value not in (None, ''):
                        row_cells[col] = value
                if row_cells:
                    row_map[row_idx] = row_cells
            sheets[name] = row_map
    return WorkbookData(sheets=sheets)


def cell(rows: dict[int, dict[str, str]], address: str, default: str = '') -> str:
    match = re.match(r'([A-Z]+)(\d+)', address)
    if not match:
        return default
    col, row = match.group(1), int(match.group(2))
    return rows.get(row, {}).get(col, default)


def sheet_table(rows: dict[int, dict[str, str]], start: int, end: int, columns: list[str]) -> list[dict[str, str]]:
    payload: list[dict[str, str]] = []
    for row_idx in range(start, end + 1):
        row = rows.get(row_idx, {})
        if not row:
            continue
        payload.append({col: row.get(col, '') for col in columns})
    return payload


def build_startup_costs(book: WorkbookData) -> list[dict[str, Any]]:
    rows = book.sheets['Startup_Costs']
    items: list[dict[str, Any]] = []
    for row_idx in range(4, 15):
        label = rows.get(row_idx, {}).get('A', '')
        if not label or label == 'Total startup cash outlay':
            continue
        amount = parse_money(rows[row_idx].get('B'))
        timing, required_for = STARTUP_TIMING_MAP.get(label, ('growth_optional', 'General launch'))
        items.append({
            'id': slug(label),
            'label': label,
            'category': rows[row_idx].get('C', 'Startup'),
            'subCategory': rows[row_idx].get('C', 'Startup'),
            'amount': amount,
            'amountLabel': money(amount),
            'timing': timing,
            'requiredFor': required_for,
            'sourceType': 'spreadsheet_model',
            'sourceLabel': 'Startup_Costs sheet',
            'editable': True,
            'includedInModel': True,
            'notes': rows[row_idx].get('D', ''),
        })

    # Add BCI as an official-rule line item, but keep it excluded from the spreadsheet startup total.
    items.insert(2, {
        'id': 'bci_background_check',
        'label': 'BCI background check',
        'category': 'Compliance',
        'subCategory': 'Compliance',
        'amount': 22,
        'amountLabel': money(22),
        'timing': 'file_now',
        'requiredFor': 'Commission filing',
        'sourceType': 'official_rule',
        'sourceLabel': 'Ohio BCI civilian background check procedures',
        'editable': False,
        'includedInModel': False,
        'notes': 'Required before filing the commission application. The spreadsheet startup total does not include this cost.',
    })
    return items


def build_fixed_costs(book: WorkbookData) -> list[dict[str, Any]]:
    rows = book.sheets['Assumptions']
    items: list[dict[str, Any]] = []
    for row_idx in range(29, 36):
        label = rows[row_idx].get('A', '')
        amount = parse_money(rows[row_idx].get('B'))
        timing, required_for = FIXED_TIMING_MAP.get(label, ('growth_optional', 'General overhead'))
        category = 'Marketing' if 'Marketing' in label else 'Systems' if 'Software' in label or 'App workflow' in label else 'Operations'
        items.append({
            'id': slug(label),
            'label': label,
            'category': category,
            'subCategory': rows[row_idx].get('A', ''),
            'amount': amount,
            'amountLabel': money(amount),
            'timing': timing,
            'requiredFor': required_for,
            'sourceType': 'spreadsheet_model',
            'sourceLabel': 'Assumptions sheet',
            'editable': True,
            'includedInModel': True,
            'notes': rows[row_idx].get('D', ''),
        })
    return items


def build_service_lanes(book: WorkbookData) -> list[dict[str, Any]]:
    assumptions = book.sheets['Assumptions']
    revenue = book.sheets['Revenue_Model']
    lanes: list[dict[str, Any]] = []

    sheet_label_to_rows = {
        'General mobile notary': (16, 16, 23),
        'Specialty mobile (hospital/title/estate)': (17, 17, 24),
        'Remote online notarization (RON)': (18, 18, 25),
        'Loan signing': (19, 19, 26),
        'Recurring B2B visit': (20, 20, 27),
    }
    revenue_rows = {
        'General mobile notary': (6, 7, 8),
        'Specialty mobile (hospital/title/estate)': (10, 11, 12),
        'Remote online notarization (RON)': (14, 15, 16),
        'Loan signing': (18, 19, 20),
        'Recurring B2B visit': (22, 23, 24),
    }

    for lane_id, meta in LANE_META.items():
        if meta['sourceType'] == 'doc_plan':
            avg_revenue = meta['avgRevenuePerAppointment']
            variable_cost = meta['variableCostPerAppointment']
            lane = {
                'id': lane_id,
                'label': meta['label'],
                'avgRevenuePerAppointment': avg_revenue,
                'avgRevenuePerAppointmentLabel': money(avg_revenue),
                'variableCostPerAppointment': variable_cost,
                'variableCostPerAppointmentLabel': money(variable_cost),
                'contributionPerAppointment': avg_revenue - variable_cost,
                'contributionPerAppointmentLabel': money(avg_revenue - variable_cost),
                'launchMonth': meta['launchMonth'],
                'profitPriority': meta['profitPriority'],
                'unlockRequirements': meta['unlockRequirements'],
                'phaseId': meta['phaseId'],
                'roadmapLaneIds': meta['roadmapLaneIds'],
                'studyModuleLinks': meta['studyModuleLinks'],
                'classification': meta['classification'],
                'bestFor': meta['bestFor'],
                'sourceType': meta['sourceType'],
                'sourceLabel': 'Business-plan narrative',
                'inSpreadsheetModel': False,
                'notes': meta['notes'],
            }
            lanes.append(lane)
            continue

        assumption_row, _, ramp_row = sheet_label_to_rows[meta['sheetLabel']]
        volume_row, revenue_row, variable_row = revenue_rows[meta['sheetLabel']]
        avg_revenue = parse_money(assumptions[assumption_row].get('B'))
        variable_cost = parse_money(assumptions[assumption_row].get('C'))
        launch_month = int(float(assumptions[ramp_row].get('B', meta['launchMonth'])))
        monthly_revenue = [parse_money(revenue[revenue_row].get(col)) for col in list('BCDEFGHIJKLM')]
        monthly_volume = [parse_money(revenue[volume_row].get(col)) for col in list('BCDEFGHIJKLM')]
        lane = {
            'id': lane_id,
            'label': meta['label'],
            'avgRevenuePerAppointment': avg_revenue,
            'avgRevenuePerAppointmentLabel': money(avg_revenue),
            'variableCostPerAppointment': variable_cost,
            'variableCostPerAppointmentLabel': money(variable_cost),
            'contributionPerAppointment': avg_revenue - variable_cost,
            'contributionPerAppointmentLabel': money(avg_revenue - variable_cost),
            'launchMonth': launch_month,
            'profitPriority': meta['profitPriority'],
            'unlockRequirements': meta['unlockRequirements'],
            'phaseId': meta['phaseId'],
            'roadmapLaneIds': meta['roadmapLaneIds'],
            'studyModuleLinks': meta['studyModuleLinks'],
            'classification': meta['classification'],
            'bestFor': meta['bestFor'],
            'sourceType': meta['sourceType'],
            'sourceLabel': 'Assumptions + Revenue_Model sheets',
            'inSpreadsheetModel': True,
            'notes': meta['notes'],
            'monthlyRevenue': monthly_revenue,
            'monthlyVolume': monthly_volume,
        }
        lanes.append(lane)

    lanes.sort(key=lambda lane: (
        ['foundation_cash', 'fast_cash', 'high_margin', 'scale_lane', 'premium_lane', 'stability_lane'].index(lane['classification']) if lane['classification'] in ['foundation_cash', 'fast_cash', 'high_margin', 'scale_lane', 'premium_lane', 'stability_lane'] else 99,
        lane['launchMonth'],
    ))
    return lanes


def build_revenue_model(book: WorkbookData) -> dict[str, Any]:
    rows = book.sheets['Revenue_Model']
    month_labels = [rows[3].get(col, f'M{index + 1}') for index, col in enumerate(list('BCDEFGHIJKLM'))]
    month_dates = [rows[4].get(col, '') for col in list('BCDEFGHIJKLM')]
    months = []
    for idx, col in enumerate(list('BCDEFGHIJKLM'), start=1):
        months.append({
            'month': idx,
            'label': month_labels[idx - 1],
            'serialDate': month_dates[idx - 1],
            'totalRevenue': parse_money(rows[26].get(col)),
            'totalVariableCost': parse_money(rows[27].get(col)),
            'contributionMargin': parse_money(rows[28].get(col)),
        })
    return {
        'months': months,
        'year1Revenue': parse_money(rows[30].get('B')),
        'year1VariableCost': parse_money(rows[31].get('B')),
        'year1Contribution': parse_money(rows[32].get('B')),
    }


def build_scenarios(book: WorkbookData) -> list[dict[str, Any]]:
    rows = book.sheets['Scenario_Summary']
    names = ['Conservative', 'Base', 'Growth']
    cols = ['B', 'C', 'D']
    payload = []
    for name, col in zip(names, cols):
        payload.append({
            'name': name,
            'volumeFactor': parse_money(rows[4].get(col)),
            'year1Revenue': parse_money(rows[6].get(col)),
            'year1VariableCost': parse_money(rows[7].get(col)),
            'year1FixedCost': parse_money(rows[8].get(col)),
            'year1Ebitda': parse_money(rows[9].get(col)),
            'avgRevenuePerAppointment': parse_money(rows[10].get(col)),
            'avgVariableCostPerAppointment': parse_money(rows[11].get(col)),
            'avgContributionPerAppointment': parse_money(rows[12].get(col)),
            'breakEvenAppointmentsPerMonth': parse_money(rows[13].get(col)),
        })
    return payload


def build_capital_plan(book: WorkbookData) -> dict[str, Any]:
    rows = book.sheets['Capital_Plan']
    use_of_funds = []
    for row_idx in range(5, 10):
        use_of_funds.append({
            'id': slug(rows[row_idx].get('A', f'use_{row_idx}')),
            'label': rows[row_idx].get('A', ''),
            'amount': parse_money(rows[row_idx].get('B')),
            'amountLabel': money(parse_money(rows[row_idx].get('B'))),
            'type': rows[row_idx].get('C', ''),
            'rationale': rows[row_idx].get('D', ''),
        })
    funding_sources = []
    for row_idx in range(13, 16):
        funding_sources.append({
            'id': slug(rows[row_idx].get('A', f'source_{row_idx}')),
            'label': rows[row_idx].get('A', ''),
            'amount': parse_money(rows[row_idx].get('B')),
            'amountLabel': money(parse_money(rows[row_idx].get('B'))),
            'type': rows[row_idx].get('C', ''),
            'rationale': rows[row_idx].get('D', ''),
        })
    approaches = []
    for row_idx in range(19, 23):
        if row_idx not in rows:
            continue
        approaches.append({
            'id': slug(rows[row_idx].get('A', f'approach_{row_idx}')),
            'label': rows[row_idx].get('A', ''),
            'whenToUse': rows[row_idx].get('B', ''),
            'recommendedScale': rows[row_idx].get('C', ''),
            'summary': rows[row_idx].get('D', ''),
        })
    return {
        'recommendedCapitalTarget': parse_money(rows[10].get('B')),
        'recommendedCapitalTargetLabel': money(parse_money(rows[10].get('B'))),
        'useOfFunds': use_of_funds,
        'fundingSources': funding_sources,
        'approaches': approaches,
    }


def build_market_context(book: WorkbookData) -> list[dict[str, Any]]:
    rows = book.sheets['Assumptions']
    items = []
    for row_idx in range(5, 10):
        items.append({
            'label': rows[row_idx].get('A', ''),
            'value': rows[row_idx].get('B', ''),
            'unit': rows[row_idx].get('C', ''),
            'source': rows[row_idx].get('D', ''),
        })
    return items


def build_summary(startup_costs: list[dict[str, Any]], fixed_costs: list[dict[str, Any]], revenue_model: dict[str, Any], scenarios: list[dict[str, Any]], capital_plan: dict[str, Any], lanes: list[dict[str, Any]]) -> dict[str, Any]:
    startup_total = sum(item['amount'] for item in startup_costs if item['includedInModel'])
    monthly_fixed = sum(item['amount'] for item in fixed_costs)
    required_now = sum(item['amount'] for item in startup_costs if item['timing'] in {'file_now', 'before_first_paid_appointment'} and item['includedInModel'])
    official_extra_now = sum(item['amount'] for item in startup_costs if item['timing'] in {'file_now', 'before_first_paid_appointment'} and not item['includedInModel'])
    base = next((scenario for scenario in scenarios if scenario['name'] == 'Base'), scenarios[0])
    highest_margin = max((lane for lane in lanes if lane.get('contributionPerAppointment') is not None), key=lambda lane: lane['contributionPerAppointment'])
    fastest_cash = next((lane for lane in lanes if lane['id'] == 'mobile_general'), lanes[0])
    best_scale = next((lane for lane in lanes if lane['id'] == 'ron'), lanes[0])
    current_profit_move = next((lane for lane in lanes if lane['id'] == 'mobile_general'), lanes[0])
    return {
        'strategyMode': STRATEGY_MODE,
        'strategyLabel': 'Aggressive scale',
        'startupCashOutlay': startup_total,
        'startupCashOutlayLabel': money(startup_total),
        'requiredCashNow': required_now,
        'requiredCashNowLabel': money(required_now),
        'officialExtraCashNow': official_extra_now,
        'officialExtraCashNowLabel': money(official_extra_now),
        'monthlyFixedOverhead': monthly_fixed,
        'monthlyFixedOverheadLabel': money(monthly_fixed),
        'year1Revenue': revenue_model['year1Revenue'],
        'year1RevenueLabel': money(revenue_model['year1Revenue']),
        'year1VariableCost': revenue_model['year1VariableCost'],
        'year1VariableCostLabel': money(revenue_model['year1VariableCost']),
        'year1Contribution': revenue_model['year1Contribution'],
        'year1ContributionLabel': money(revenue_model['year1Contribution']),
        'year1Ebitda': base['year1Ebitda'],
        'year1EbitdaLabel': money(base['year1Ebitda']),
        'breakEvenAppointmentsPerMonth': round(base['breakEvenAppointmentsPerMonth'], 2),
        'breakEvenAppointmentsPerMonthLabel': f"{base['breakEvenAppointmentsPerMonth']:.2f}",
        'recommendedCapitalTarget': capital_plan['recommendedCapitalTarget'],
        'recommendedCapitalTargetLabel': capital_plan['recommendedCapitalTargetLabel'],
        'highestMarginLaneId': highest_margin['id'],
        'highestMarginLaneLabel': highest_margin['label'],
        'fastestCashLaneId': fastest_cash['id'],
        'fastestCashLaneLabel': fastest_cash['label'],
        'bestScaleLaneId': best_scale['id'],
        'bestScaleLaneLabel': best_scale['label'],
        'currentProfitMove': {
            'label': 'Launch mobile general first, then tilt into specialty mobile as soon as the SOPs are clean.',
            'why': 'Aggressive scale works best when you create fast local cash first and then shift into higher-margin specialty visits.',
            'unlocks': 'Specialty margin, RON scale, and later premium signings without burning cash too early.',
        },
        'buyNowVsLater': {
            'buyNow': ['Ohio notary education/testing', 'Ohio commission filing', 'Seal, journal, supplies', 'E&O insurance'],
            'buyLater': ['RON education/testing', 'RON filing', 'E-seal / digital certificate / RON setup', 'Printer / scanner / signing supplies'],
            'delayUntilDemandIsProven': ['Heavy printer/scanner spend for loan signings', 'RON stack before commission is active'],
            'highRoiSpend': ['Marketing / reviews / local SEO', 'App workflow tools / automations', 'Website / domain / brand setup'],
        },
    }


def build_cost_groups(startup_costs: list[dict[str, Any]], fixed_costs: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    def ordered(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return sorted(items, key=lambda item: (item['timing'], item['label'].lower()))

    startup_groups = {
        'compliance': ordered([item for item in startup_costs if item['category'] == 'Compliance']),
        'entity': ordered([item for item in startup_costs if item['category'] == 'Entity']),
        'insurance': ordered([item for item in startup_costs if item['category'] == 'Insurance']),
        'equipment': ordered([item for item in startup_costs if item['category'] in {'Equipment'}]),
        'software_systems': ordered([item for item in startup_costs if item['label'] in {'Phone / scheduling / software setup', 'E-seal / digital certificate / RON setup'}]),
        'marketing_launch': ordered([item for item in startup_costs if item['label'] in {'Website / domain / brand setup'}]),
    }
    fixed_groups = {
        'systems': ordered([item for item in fixed_costs if item['category'] == 'Systems']),
        'marketing': ordered([item for item in fixed_costs if item['category'] == 'Marketing']),
        'operations': ordered([item for item in fixed_costs if item['category'] == 'Operations']),
    }
    return {'startup': startup_groups, 'fixed': fixed_groups}


def extract_doc_summary(paragraphs: list[str]) -> dict[str, Any]:
    def find_after(prefix: str) -> str:
        for index, paragraph in enumerate(paragraphs):
            if paragraph == prefix and index + 1 < len(paragraphs):
                return paragraphs[index + 1]
        return ''

    return {
        'title': paragraphs[0] if paragraphs else 'Formal Notary Business Plan',
        'businessName': paragraphs[1] if len(paragraphs) > 1 else 'Columbus Ohio Notary Services',
        'preparedFor': paragraphs[2] if len(paragraphs) > 2 else 'Prepared for lender / grant review',
        'date': paragraphs[3] if len(paragraphs) > 3 else '',
        'startupCashOutlayLabel': find_after('Startup cash outlay'),
        'year1RevenueLabel': find_after('Year 1 revenue'),
        'year1EbitdaLabel': find_after('Year 1 EBITDA'),
        'breakEvenMonthlyLabel': find_after('Break-even / month'),
        'executiveSummary': paragraphs[15] if len(paragraphs) > 15 else '',
        'summaryMetrics': paragraphs[16] if len(paragraphs) > 16 else '',
        'capitalSummary': paragraphs[17] if len(paragraphs) > 17 else '',
        'businessOverview': paragraphs[19:27],
        'marketAnalysis': paragraphs[48:53],
        'pricingLogic': paragraphs[53:79],
        'operations': paragraphs[80:88],
        'marketing': paragraphs[88:94],
        'financialPlan': paragraphs[94:118],
        'capitalPlan': paragraphs[134:175],
        'riskAssessment': paragraphs[176:181],
        'milestones': paragraphs[182:197],
        'sources': paragraphs[198:210],
    }


def join_lines(lines: list[str], prefix: str = '- ') -> str:
    return '\n'.join(f'{prefix}{line}' for line in lines if line)


def build_business_plan(finance: dict[str, Any], doc_summary: dict[str, Any]) -> dict[str, Any]:
    summary = finance['summary']
    service_lanes = finance['serviceLanes']
    capital = finance['capitalPlan']
    scenarios = finance['scenarios']
    market_context = finance['marketContext']

    sections = []

    sections.append({
        'id': 'executive-summary',
        'title': 'Executive Summary',
        'contentMarkdown': f"""## Executive Summary
Columbus Ohio Notary Services is positioned as a Columbus-based hybrid notary business built around convenience, specialty service, digital delivery, and repeat client relationships.

- Strategy mode: Aggressive scale
- Startup cash outlay from model: {summary['startupCashOutlayLabel']}
- Monthly fixed overhead: {summary['monthlyFixedOverheadLabel']}
- Year 1 revenue (base case): {summary['year1RevenueLabel']}
- Year 1 EBITDA (base case): {summary['year1EbitdaLabel']}
- Break-even volume: {summary['breakEvenAppointmentsPerMonthLabel']} appointments/month
- Recommended capital target: {summary['recommendedCapitalTargetLabel']}

{doc_summary['executiveSummary']}

{doc_summary['summaryMetrics']}

{doc_summary['capitalSummary']}
""",
    })

    sections.append({
        'id': 'business-description',
        'title': 'Business Description',
        'contentMarkdown': f"""## Business Description
The business operates as a Columbus-based Ohio notary service with a phased revenue model that protects compliance first, then scales the highest-value lanes.

{join_lines(doc_summary['businessOverview'])}

- Core principle: do not rely only on the statutory act fee.
- Revenue engine: combine lawful act fees with pre-agreed travel, specialty, urgency, package, and repeat-account economics where permitted.
- Process standard: the Mac app remains the operating system for intake, readiness, pricing discipline, route logic, and milestone tracking.
""",
    })

    lane_lines = []
    for lane in service_lanes:
        lane_lines.append(
            f"- {lane['label']}: {lane['avgRevenuePerAppointmentLabel']} revenue / {lane['variableCostPerAppointmentLabel']} variable cost / {lane['contributionPerAppointmentLabel']} contribution per appointment. Best for {lane['bestFor']}."
        )
    sections.append({
        'id': 'services-and-revenue-lanes',
        'title': 'Services and Revenue Lanes',
        'contentMarkdown': f"""## Services and Revenue Lanes
The business uses six tracked revenue lanes inside Notary OS so each lane can be turned on only after its prerequisites are satisfied.

{chr(10).join(lane_lines)}

Profit-max order for this build:
1. Employer / in-office for low-risk reps
2. Mobile general for fastest cash
3. Specialty mobile for best early margin
4. RON for best scale
5. Loan signing for highest late-stage margin
6. Recurring B2B for stability
""",
    })

    market_lines = []
    for item in market_context:
        market_lines.append(f"- {item['label']}: {item['value']} {item['unit']} ({item['source']})")
    sections.append({
        'id': 'market-and-service-area',
        'title': 'Market and Columbus Service-Area Strategy',
        'contentMarkdown': f"""## Market and Columbus Service-Area Strategy
Primary launch geography: Columbus, Franklin County, and nearby suburbs.

{join_lines(doc_summary['marketAnalysis'])}

Key market signals used in this plan:
{chr(10).join(market_lines)}

Initial market focus:
- General public urgent documents
- Employer / internal volume
- Hospital / hospice / bedside signers
- Title / vehicle-related users
- Future law-firm, healthcare, HR, and property-manager accounts
""",
    })

    sections.append({
        'id': 'operations-and-launch-sequence',
        'title': 'Operations and Launch Sequence',
        'contentMarkdown': f"""## Operations and Launch Sequence
The launch sequence is intentionally staged so the business becomes profitable without front-loading every cost at once.

1. File and activate the commission.
2. Finish the first-appointment launch kit.
3. Run low-risk employer / general mobile appointments.
4. Add specialty mobile after the intake and refusal SOPs are solid.
5. Add RON after separate Ohio authorization and tech setup.
6. Add loan signing after printer/scanner and package discipline are ready.
7. Add recurring B2B packages after repeatable delivery and invoicing are stable.

Operating-system support inside the app:
{join_lines(doc_summary['operations'])}
""",
    })

    official_rule_lines = []
    for rule in finance['officialRules']:
        official_rule_lines.append(f"- {rule['label']}: {rule['value']} {rule['unit']} — {rule['notes']}")
    sections.append({
        'id': 'compliance-and-fee-controls',
        'title': 'Compliance and Fee Controls',
        'contentMarkdown': f"""## Compliance and Fee Controls
Ohio fee controls and filing rules are encoded directly into the finance model so the business plan does not accidentally optimize around unlawful pricing.

{chr(10).join(official_rule_lines)}

Guardrails:
- Do not treat travel as a per-signature fee.
- Do not perform RON until the separate Ohio authorization is active.
- Do not use a notary seal for I-9 authorized representative work.
- Do not monetize prohibited or unauthorized services.
""",
    })

    startup_lines = []
    for item in finance['startupCosts']:
        inclusion = 'included in model' if item['includedInModel'] else 'official add-on / not in model total'
        startup_lines.append(f"- {item['label']}: {item['amountLabel']} ({item['timing']}; {inclusion})")
    fixed_lines = []
    for item in finance['fixedCosts']:
        fixed_lines.append(f"- {item['label']}: {item['amountLabel']}/month")
    sections.append({
        'id': 'financial-model-and-scenarios',
        'title': 'Financial Model and Scenario Analysis',
        'contentMarkdown': f"""## Financial Model and Scenario Analysis
Base-case financial targets:
- Revenue: {summary['year1RevenueLabel']}
- Variable cost: {summary['year1VariableCostLabel']}
- Contribution: {summary['year1ContributionLabel']}
- EBITDA: {summary['year1EbitdaLabel']}
- Fixed monthly overhead: {summary['monthlyFixedOverheadLabel']}
- Break-even volume: {summary['breakEvenAppointmentsPerMonthLabel']} appointments/month

Startup and launch spend:
{chr(10).join(startup_lines)}

Monthly overhead:
{chr(10).join(fixed_lines)}

Scenario view:
{chr(10).join(f"- {scenario['name']}: {money(scenario['year1Revenue'])} revenue / {money(scenario['year1Ebitda'])} EBITDA / {scenario['breakEvenAppointmentsPerMonth']:.2f} break-even appointments per month" for scenario in scenarios)}
""",
    })

    use_of_funds_lines = [f"- {item['label']}: {item['amountLabel']} — {item['rationale']}" for item in capital['useOfFunds']]
    source_lines = [f"- {item['label']}: {item['amountLabel']} — {item['rationale']}" for item in capital['fundingSources']]
    approach_lines = [f"- {item['label']}: {item['whenToUse']} / {item['recommendedScale']} — {item['summary']}" for item in capital['approaches']]
    sections.append({
        'id': 'capital-plan-and-use-of-funds',
        'title': 'Capital Plan and Use of Funds',
        'contentMarkdown': f"""## Capital Plan and Use of Funds
Recommended capital target: {capital['recommendedCapitalTargetLabel']}

Use of funds:
{chr(10).join(use_of_funds_lines)}

Suggested funding structure:
{chr(10).join(source_lines)}

Funding approach ladder:
{chr(10).join(approach_lines)}
""",
    })

    sections.append({
        'id': 'marketing-and-client-acquisition',
        'title': 'Marketing and Client Acquisition',
        'contentMarkdown': f"""## Marketing and Client Acquisition
Early marketing should stay conversion-focused rather than vanity-focused.

{join_lines(doc_summary['marketing'])}

Priority channels:
- Google Business Profile and reviews
- Simple pricing-forward website
- Local SEO and citations
- Direct outreach to elder-care, hospice, HR, property-management, and title-adjacent contacts
- Repeat-account follow-up once the first 30 paid appointments are complete
""",
    })

    sections.append({
        'id': 'milestones-risks-next-steps',
        'title': 'Milestones, Risks, and Next-Step Execution Plan',
        'contentMarkdown': f"""## Milestones, Risks, and Next-Step Execution Plan
Top operating risks:
{join_lines(doc_summary['riskAssessment'])}

Milestones:
{join_lines(doc_summary['milestones'])}

Immediate next actions:
1. File the Ohio commission application.
2. Finish the first-appointment launch kit.
3. Activate mobile general as the first fast-cash lane.
4. Track margin by lane, route, and overhead weekly.
5. Unlock specialty mobile, then RON, then premium work in sequence.
""",
    })

    markdown = '# Columbus Ohio Notary Services — Detailed Business Plan\n\n' + '\n\n'.join(section['contentMarkdown'] for section in sections)
    one_page = f"""# Columbus Ohio Notary Services — One-Page Financial Summary

## Core numbers
- Startup cash outlay: {summary['startupCashOutlayLabel']}
- Required cash now: {summary['requiredCashNowLabel']}
- Monthly fixed overhead: {summary['monthlyFixedOverheadLabel']}
- Year 1 revenue: {summary['year1RevenueLabel']}
- Year 1 EBITDA: {summary['year1EbitdaLabel']}
- Break-even: {summary['breakEvenAppointmentsPerMonthLabel']} appointments/month
- Recommended capital target: {summary['recommendedCapitalTargetLabel']}

## Best lane calls
- Fastest cash: {summary['fastestCashLaneLabel']}
- Highest margin: {summary['highestMarginLaneLabel']}
- Best scale: {summary['bestScaleLaneLabel']}

## Do this now
- {summary['currentProfitMove']['label']}
- Why: {summary['currentProfitMove']['why']}
- Unlocks: {summary['currentProfitMove']['unlocks']}
"""
    return {
        'metadata': {
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'privateUseOnly': True,
            'sourceFiles': [str(DEFAULT_XLSX), str(DEFAULT_DOCX)],
        },
        'title': 'Columbus Ohio Notary Services — Detailed Business Plan',
        'sections': sections,
        'exportMarkdown': markdown,
        'onePageFinancialSummary': one_page,
    }


def build_payload(xlsx_path: Path, docx_path: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    workbook = workbook_sheet_map(xlsx_path)
    paragraphs = load_docx_paragraphs(docx_path)
    doc_summary = extract_doc_summary(paragraphs)
    startup_costs = build_startup_costs(workbook)
    fixed_costs = build_fixed_costs(workbook)
    revenue_model = build_revenue_model(workbook)
    scenarios = build_scenarios(workbook)
    lanes = build_service_lanes(workbook)
    capital_plan = build_capital_plan(workbook)
    market_context = build_market_context(workbook)
    summary = build_summary(startup_costs, fixed_costs, revenue_model, scenarios, capital_plan, lanes)
    cost_groups = build_cost_groups(startup_costs, fixed_costs)

    finance = {
        'metadata': {
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'privateUseOnly': True,
            'strategyMode': STRATEGY_MODE,
            'sourceFiles': {
                'financialModel': str(xlsx_path),
                'businessPlan': str(docx_path),
            },
        },
        'summary': summary,
        'officialRules': OFFICIAL_RULES,
        'marketContext': market_context,
        'startupCosts': startup_costs,
        'fixedCosts': fixed_costs,
        'costGroups': cost_groups,
        'serviceLanes': lanes,
        'revenueModel': revenue_model,
        'scenarios': scenarios,
        'capitalPlan': capital_plan,
    }
    business_plan = build_business_plan(finance, doc_summary)
    return finance, business_plan


def main() -> None:
    parser = argparse.ArgumentParser(description='Build finance and business-plan JSON assets for the Mac app.')
    parser.add_argument('--xlsx', type=Path, default=DEFAULT_XLSX)
    parser.add_argument('--docx', type=Path, default=DEFAULT_DOCX)
    parser.add_argument('--finance-output', type=Path, default=DEFAULT_FINANCE_OUTPUT)
    parser.add_argument('--business-plan-output', type=Path, default=DEFAULT_BUSINESS_PLAN_OUTPUT)
    args = parser.parse_args()

    xlsx = args.xlsx.expanduser().resolve()
    docx = args.docx.expanduser().resolve()
    finance_output = args.finance_output.expanduser().resolve()
    business_output = args.business_plan_output.expanduser().resolve()

    if not xlsx.exists():
        raise SystemExit(f'Missing financial model workbook: {xlsx}')
    if not docx.exists():
        raise SystemExit(f'Missing business plan DOCX: {docx}')

    finance_output.parent.mkdir(parents=True, exist_ok=True)
    business_output.parent.mkdir(parents=True, exist_ok=True)

    finance, business_plan = build_payload(xlsx, docx)
    finance_output.write_text(json.dumps(finance, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    business_output.write_text(json.dumps(business_plan, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Wrote finance model content to {finance_output}')
    print(f'Wrote business plan content to {business_output}')


if __name__ == '__main__':
    main()
