#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from pypdf import PdfReader

DEFAULT_SOURCE = Path('/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf')
DEFAULT_OUTPUT = Path(__file__).resolve().parent / 'SeededCourse' / 'notary-course-content.json'
PACKET_DATE = '2025-04-02'


def make_module(
    module_id: str,
    title: str,
    summary: str,
    sort_order: int,
    pages: tuple[int, int],
    exam_weight: int,
    key_terms: list[str],
    checklist: list[str],
    mistakes: list[str],
    rules: list[dict[str, Any]],
    flashcards: list[dict[str, Any]],
    questions: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        'id': module_id,
        'title': title,
        'summary': summary,
        'sortOrder': sort_order,
        'sourcePageStart': pages[0],
        'sourcePageEnd': pages[1],
        'examWeight': exam_weight,
        'keyTerms': key_terms,
        'checklistBullets': checklist,
        'commonMistakes': mistakes,
        'rules': rules,
        'flashcards': flashcards,
        'questions': questions,
    }


def rule(rule_id: str, text: str, pages: str, high: bool = True) -> dict[str, Any]:
    return {
        'id': rule_id,
        'ruleText': text,
        'sourcePages': pages,
        'isHighPriority': high,
    }


def flashcard(card_id: str, prompt: str, answer: str, pages: str, difficulty: str = 'core') -> dict[str, Any]:
    return {
        'id': card_id,
        'prompt': prompt,
        'answer': answer,
        'sourcePages': pages,
        'difficulty': difficulty,
    }


def question(
    qid: str,
    question_text: str,
    choices: list[str],
    correct_choice: str,
    explanation: str,
    pages: str,
    packet_sample: bool = False,
) -> dict[str, Any]:
    return {
        'id': qid,
        'question': question_text,
        'choices': choices,
        'correctChoice': correct_choice,
        'explanation': explanation,
        'sourcePages': pages,
        'isFromPacketSample': packet_sample,
    }


def build_payload(source: Path) -> dict[str, Any]:
    reader = PdfReader(str(source))
    page_count = len(reader.pages)
    expected_checks = {
        115: '30 Questions',
        121: 'HB 315',
        149: '$30.00',
    }
    for page, needle in expected_checks.items():
        text = (reader.pages[page - 1].extract_text() or '')
        if needle not in text:
            raise RuntimeError(f'Unexpected packet content on page {page}: missing {needle!r}')

    modules: list[dict[str, Any]] = [
        make_module(
            'overview_test_specifics',
            'Course Overview + Test Specifics',
            'The Ohio course packet frames the notary public as an impartial witness and makes the testing targets explicit: 30 questions, one hour, 80% to pass, and a 30-day retake window if you fail.',
            10,
            (53, 57),
            4,
            ['Impartial witness', '80% passing score', '30-question exam', '1-hour exam', '30-day retake'],
            [
                'Know the exact test format cold before you spend energy memorizing details.',
                'Treat the packet as an exam-prep document, not just a reference manual.',
                'Expect random questions drawn from the full packet, not just the sample questions.',
            ],
            [
                'Forgetting the pass threshold.',
                'Confusing packet sample questions with the full bank.',
                'Thinking the exam is open-ended instead of multiple-choice and random.',
            ],
            [
                rule('overview_1', 'The exam is 30 questions, one hour, and requires 80% to pass.', '86, 115', True),
                rule('overview_2', 'If you fail, the packet says you have a 30-day retake window.', '115', True),
                rule('overview_3', 'A notary public is an impartial witness to transactions.', '58', True),
                rule('overview_4', 'The packet warns that Ohio notary law changes, so check the Revised Code for updates.', '86', False),
            ],
            [
                flashcard('overview_fc_1', 'How many questions are on the course test?', '30 questions.', '115', 'core'),
                flashcard('overview_fc_2', 'What score do you need to pass?', '80 percent.', '86, 115', 'core'),
                flashcard('overview_fc_3', 'How long do you get for the test?', 'One hour.', '115', 'core'),
            ],
            [
                question('overview_q_1', 'What passing score does the Ohio course packet list for the exam?', ['70%', '75%', '80%', '90%'], 'C', 'The packet states a passing score of 80 percent.', '86, 115', True),
                question('overview_q_2', 'Which description best matches the packet’s definition of a notary public?', ['A legal advocate for both sides', 'An impartial witness to transactions', 'A records clerk for the Secretary of State', 'A title examiner'], 'B', 'Page 58 defines a notary public as a person commissioned to serve as an impartial witness to transactions.', '58', False),
            ],
        ),
        make_module(
            'qualifications_application',
            'Qualifications + Application Flow',
            'The packet covers who qualifies, the BCI timing window, education/testing, commission term, and statewide jurisdiction. This is core exam content and also your real-life filing checklist.',
            20,
            (61, 65),
            5,
            ['Age 18', 'Ohio resident', 'BCI within six months', 'Five-year term', 'Statewide jurisdiction'],
            [
                'Memorize the qualification stack: age, residency, BCI, education, testing.',
                'Remember that non-attorneys have a five-year term.',
                'Remember that jurisdiction is statewide, not county-limited.',
            ],
            [
                'Mixing up the BCI six-month window.',
                'Confusing residency rules for attorneys versus non-attorneys.',
                'Forgetting that a standard commission lasts five years unless revoked.',
            ],
            [
                rule('qual_1', 'A non-attorney applicant must be at least 18 and a legal resident of Ohio.', '61', True),
                rule('qual_2', 'The criminal records check must be completed within the preceding six months.', '61, 63', True),
                rule('qual_3', 'A non-attorney must successfully complete education and pass a test.', '61', True),
                rule('qual_4', 'A notary public has statewide jurisdiction.', '65', True),
                rule('qual_5', 'A standard notary commission term is five years unless revoked.', '64', True),
                rule('qual_6', 'Attorneys and some peace-officer applicants have specific exceptions under the packet rules.', '62, 64, 65', False),
            ],
            [
                flashcard('qual_fc_1', 'How old must a non-attorney Ohio notary applicant be?', 'At least 18 years old.', '61', 'core'),
                flashcard('qual_fc_2', 'How old can the BCI report be when used?', 'No more than six months old.', '61, 63', 'core'),
                flashcard('qual_fc_3', 'How long is a non-attorney commission term?', 'Five years, unless revoked.', '64', 'core'),
            ],
            [
                question('qual_q_1', 'A non-attorney Ohio notary commission generally lasts:', ['2 years', '3 years', '5 years', 'For life'], 'C', 'The packet states each notary public shall hold office for five years unless the commission is revoked.', '64, 116', True),
                question('qual_q_2', 'Which item must be completed within the preceding six months?', ['Education certificate', 'BCI report', 'Oath', 'Seal order'], 'B', 'The criminal records check report must be completed within the preceding six months.', '61, 63', False),
                question('qual_q_3', 'What is the packet’s rule on jurisdiction?', ['County only', 'Statewide', 'Only the county of commission issuance', 'Only where the signer resides'], 'B', 'The packet says an Ohio notary public has statewide jurisdiction.', '65', False),
            ],
        ),
        make_module(
            'recordkeeping_updates',
            'Recordkeeping + Secretary of State Updates',
            'The packet expects you to know what changes must be reported and what administrative records the Secretary of State can issue.',
            30,
            (60, 63),
            3,
            ['Name change', 'Address change', 'Resignation', 'Disqualifying offense', 'Duplicate commission'],
            [
                'Know what changes trigger a reporting duty.',
                'Keep the duplicate/certified-copy fee details separated in your head.',
            ],
            [
                'Confusing duplicate commission with certified copy fee.',
                'Forgetting to report disqualifying offenses.',
            ],
            [
                rule('records_1', 'The packet lists change of name, change of address, resignation, and conviction of a disqualifying offense as record-keeping items.', '60', True),
                rule('records_2', 'A duplicate commission may be issued upon the required form submission and fee.', '60', False),
                rule('records_3', 'A certified copy of a commission costs five dollars.', '60-61', True),
                rule('records_4', 'A criminal records check is not a public record.', '63', False),
            ],
            [
                flashcard('records_fc_1', 'What four changes does the packet list under record-keeping?', 'Name change, address change, resignation, and conviction of a disqualifying offense.', '60', 'core'),
                flashcard('records_fc_2', 'Is a criminal records check report a public record?', 'No.', '63', 'core'),
            ],
            [
                question('records_q_1', 'According to the packet, a certified copy of a notary commission costs:', ['$2', '$5', '$10', '$15'], 'B', 'Page 61 lists a five-dollar fee for each certified copy.', '61', False),
                question('records_q_2', 'Which item is listed as a record-keeping/reporting issue in the packet?', ['Favorite office supply brand', 'Change of address', 'Vehicle mileage', 'Number of witnesses at the last act'], 'B', 'The packet specifically lists change of address among the updates to track.', '60', False),
            ],
        ),
        make_module(
            'fees_seal_journal',
            'Fees + Seal + Journal',
            'Exam questions can easily test your fee caps, travel fee rule, reasonable technology fee, and the packet’s journaling guidance.',
            40,
            (65, 69),
            5,
            ['Seal', '$5 act fee', '$30 online fee', '$10 tech fee', 'Travel fee', 'Journal best practice'],
            [
                'Separate statutory act fees from travel and tech fees.',
                'Remember that a traditional journal is best practice even if not mandatory.',
                'Remember the seal is part of the completed certificate package.',
            ],
            [
                'Charging both traditional and online fees for the same act.',
                'Treating travel as included instead of separately agreed.',
                'Forgetting the journal step in the packet’s five-step notarial flow.',
            ],
            [
                rule('fees_1', 'The fee for a notarial act that is not an online notarization is up to five dollars.', '67', True),
                rule('fees_2', 'The fee for an online notarization is up to thirty dollars.', '67, 149', True),
                rule('fees_3', 'A technology fee of up to ten dollars is listed for online notarization.', '67, 123, 149', True),
                rule('fees_4', 'A notary may charge a reasonable travel fee if agreed to by the principal before the act.', '67', True),
                rule('fees_5', 'While a traditional journal is not required, the packet calls it a best practice.', '66', True),
                rule('fees_6', 'The packet’s notarial steps are: verify identity, create journal entry, administer act, complete certificate, collect fee.', '69', True),
            ],
            [
                flashcard('fees_fc_1', 'Maximum non-online notarial act fee?', 'Up to $5.', '67', 'core'),
                flashcard('fees_fc_2', 'Maximum online notarial act fee?', 'Up to $30.', '67, 149', 'core'),
                flashcard('fees_fc_3', 'When can you charge travel?', 'When the travel fee is reasonable and agreed to before the act.', '67', 'core'),
                flashcard('fees_fc_4', 'What are the five packet notarial steps?', 'Verify identity, create journal entry, administer act, complete certificate, collect fee.', '69', 'challenge'),
            ],
            [
                question('fees_q_1', 'What is the maximum fee listed in the packet for a non-online notarial act?', ['$2', '$5', '$10', '$30'], 'B', 'Page 67 states up to five dollars for a notarial act that is not an online notarization.', '67', False),
                question('fees_q_2', 'Which fee can be added if agreed to in advance?', ['A second statutory act fee', 'A travel fee', 'A county surcharge', 'A witness penalty fee'], 'B', 'The packet says a reasonable travel fee may be charged if agreed to prior to the act.', '67', False),
                question('fees_q_3', 'Which sequence matches the packet’s listed notarial steps?', ['Collect fee, verify identity, complete certificate, journal, administer act', 'Verify identity, create journal entry, administer act, complete certificate, collect fee', 'Verify identity, collect fee, administer oath, mail certificate, create journal entry', 'Journal, collect fee, verify identity, complete certificate, administer act'], 'B', 'Page 69 gives the five-step sequence in that order.', '69', False),
            ],
        ),
        make_module(
            'notarial_acts_101',
            'Notarial Acts 101',
            'This module anchors the core act types and the packet’s insistence that every act gets a completed certificate.',
            50,
            (68, 72),
            4,
            ['Notarial act', 'Notarial certificate', 'Acknowledgment', 'Jurat'],
            [
                'Know the packet’s definitions, not just your intuition.',
                'Remember every notarial act requires a completed notarial certificate.',
            ],
            [
                'Thinking the certificate is optional.',
                'Confusing the act itself with the certificate that memorializes it.',
            ],
            [
                rule('acts_1', 'Notarial acts are acts the laws and regulations of Ohio authorize a notary public to perform.', '68', True),
                rule('acts_2', 'A notarial certificate is the part of or attachment to a document completed by the notary and bearing the notary signature and seal.', '71', True),
                rule('acts_3', 'A notary public shall provide a completed notarial certificate for every notarial act performed.', '71', True),
                rule('acts_4', 'If the certificate indicates the wrong act type, the notary must provide a correct certificate at no charge.', '72', True),
            ],
            [
                flashcard('acts_fc_1', 'Does every notarial act require a completed certificate?', 'Yes.', '71', 'core'),
                flashcard('acts_fc_2', 'What must a notary do if the certificate states the wrong act type?', 'Provide a correct certificate at no charge.', '72', 'core'),
            ],
            [
                question('acts_q_1', 'If a certificate incorrectly indicates the type of notarization performed, the notary should:', ['Leave it alone', 'Charge a correction fee', 'Provide a correct certificate at no charge', 'Void the entire document automatically'], 'C', 'Page 72 says the notary shall provide a correct certificate at no charge.', '72', False),
                question('acts_q_2', 'Which statement is true according to the packet?', ['A certificate is optional if the signer already knows the notary', 'A completed notarial certificate is required for every notarial act', 'A certificate is required only for jurats', 'A certificate is required only in court filings'], 'B', 'The packet says a notary public shall provide a completed notarial certificate for every act.', '71', False),
            ],
        ),
        make_module(
            'identity_appearance_rules',
            'Identity + Appearance Rules',
            'The exam is likely to test personal appearance, acceptable identification, signature by mark, and designated alternative signer rules.',
            60,
            (69, 71),
            5,
            ['Personal appearance', 'Satisfactory evidence', 'Current or expired less than 3 years', 'Signature by mark', 'Designated alternative signer'],
            [
                'Memorize the current-or-expired-less-than-three-years rule.',
                'Keep personal appearance front and center for non-online acts.',
                'Know the difference between signature by mark and designated alternative signer.',
            ],
            [
                'Using phone identification or someone else’s word without following Ohio rules.',
                'Letting a document be notarized without personal appearance.',
                'Forgetting that the signer must make the mark personally for a signature by mark.',
            ],
            [
                rule('identity_1', 'Excluding online notarizations, the principal must personally appear before the notary.', '69', True),
                rule('identity_2', 'Identification must contain a photo or signature, be current or expired less than three years, and be satisfactory to the notary.', '70, 88', True),
                rule('identity_3', 'A designated alternative signer may sign on behalf of an individual whose physical characteristics limit signing ability.', '70', True),
                rule('identity_4', 'For signature by mark, the signer must make the mark on their own and with intent to sign.', '71', True),
                rule('identity_5', 'A credible witness is not a shortcut; the packet points to the specific Ohio rules for when it can be used.', '89', False),
            ],
            [
                flashcard('identity_fc_1', 'How old can acceptable ID be if expired?', 'Expired less than three years.', '70, 88', 'core'),
                flashcard('identity_fc_2', 'Must a principal personally appear for a non-online notarization?', 'Yes.', '69', 'core'),
                flashcard('identity_fc_3', 'For a signature by mark, who must make the mark?', 'The signer must make the mark personally and with intent to sign.', '71', 'core'),
            ],
            [
                question('identity_q_1', 'For a non-online notarization, the packet says the principal must:', ['Email a copy of the signed document', 'Personally appear before the notary', 'Call the notary on speakerphone', 'Appear only if the document is a title'], 'B', 'The packet says the principal is required to personally appear before the notary public.', '69', False),
                question('identity_q_2', 'Which ID description matches the packet rule?', ['Must be issued within the last year only', 'Must contain photo or signature and be current or expired less than three years', 'Must always be a driver license', 'May be expired any length of time if familiar'], 'B', 'Page 70 gives the photo/signature and current-or-expired-less-than-three-years standard.', '70, 88', False),
                question('identity_q_3', 'A signer who can only sign with an “X” may do so if:', ['A family member draws it for them', 'The notary draws it', 'The signer personally makes the mark with intent to sign', 'The signer texts consent later'], 'C', 'The packet says the signer must make the mark on their own and with intent to sign.', '71', False),
            ],
        ),
        make_module(
            'acknowledgments',
            'Acknowledgments',
            'This is one of the most testable topics: appearance, identity, acknowledgment of execution, “free act and deed,” and certificate wording.',
            70,
            (73, 79),
            5,
            ['Acknowledgment', 'Free act and deed', 'Acknowledged before me', 'Representative capacity'],
            [
                'Memorize the packet definition of acknowledgment.',
                'Look for “acknowledged before me” language.',
                'Remember the signer can acknowledge execution rather than sign in front of you, but appearance is still required.',
            ],
            [
                'Confusing an acknowledgment with a jurat.',
                'Skipping the free-act-and-deed question.',
                'Forgetting that representative-capacity acknowledgments exist.',
            ],
            [
                rule('ack_1', 'An acknowledgment is a declaration before the notary that the individual signed the record for the purpose stated in the record.', '73', True),
                rule('ack_2', 'The person acknowledging must appear before the notary and be known or proven by satisfactory evidence.', '74', True),
                rule('ack_3', 'The packet tells notaries to ask whether the acknowledgment is the principal’s free act and deed.', '74, 77', True),
                rule('ack_4', 'Recognized certificate language includes “acknowledged before me” or substantial equivalent.', '75-76', True),
                rule('ack_5', 'Use the appropriate certificate and do not confuse acknowledgment wording with jurat wording.', '76', True),
            ],
            [
                flashcard('ack_fc_1', 'Key phrase for acknowledgment certificate recognition?', 'Acknowledged before me.', '75-76', 'core'),
                flashcard('ack_fc_2', 'What question does the packet say to ask in an acknowledgment?', 'Ask whether it is the signer’s free act and deed.', '74, 77', 'core'),
                flashcard('ack_fc_3', 'Does an acknowledgment still require personal appearance?', 'Yes.', '73-77', 'core'),
            ],
            [
                question('ack_q_1', 'Which phrase points most strongly to an acknowledgment?', ['Sworn to and subscribed before me', 'Acknowledged before me', 'Under penalty of perjury', 'Personally appeared and deposes'], 'B', 'The packet identifies “acknowledged before me” as core acknowledgment wording.', '75-76', False),
                question('ack_q_2', 'In administering an acknowledgment, the notary should ask whether the document is the principal’s:', ['Daily record and ledger', 'True copy and duplicate', 'Free act and deed', 'Final court filing'], 'C', 'The packet specifically references asking whether it is the signer’s free act and deed.', '74, 77', False),
                question('ack_q_3', 'Which is true about acknowledgments under the packet?', ['They do not require identity verification', 'They can replace a required jurat anytime', 'The signer must appear and acknowledge executing the instrument', 'They are used only for corporations'], 'C', 'Acknowledgments require appearance and acknowledgment of execution.', '73-77', False),
            ],
        ),
        make_module(
            'jurats_affidavits_oaths',
            'Jurats, Affidavits, Oaths, and Affirmations',
            'Jurats are heavily tested because they require an oath or affirmation and the signer must sign in the notary’s presence.',
            80,
            (72, 81),
            5,
            ['Jurat', 'Subscribed and sworn', 'Oath', 'Affirmation', 'Affidavit'],
            [
                'Anchor on the key jurat words: subscribed and sworn, sworn to, affirmed, being duly sworn.',
                'Remember the oath/affirmation is mandatory for a jurat.',
                'Remember the signer signs in your presence for a jurat.',
            ],
            [
                'Using an acknowledgment when an oath is required.',
                'Forgetting to actually administer the oath or affirmation.',
                'Confusing affidavit content with certificate wording.',
            ],
            [
                rule('jurat_1', 'A jurat certificate must state that an oath or affirmation was administered.', '72', True),
                rule('jurat_2', 'Key words for a jurat include subscribed and sworn, sworn to, being duly sworn, jurat, or affirmed.', '73', True),
                rule('jurat_3', 'Jurat steps: verify identity, create journal entry, administer oath or affirmation, have the principal sign, complete certificate, collect fee.', '80', True),
                rule('jurat_4', 'A sample oath is “Do you solemnly swear that the statements in this document are true, so help you God?”', '80', False),
                rule('jurat_5', 'A sample affirmation is “Do you affirm, under penalty of perjury, that the statements in this document are true?”', '81', False),
            ],
            [
                flashcard('jurat_fc_1', 'What makes a jurat different from an acknowledgment?', 'A jurat requires an oath or affirmation and signature in the notary’s presence.', '72, 80-81', 'core'),
                flashcard('jurat_fc_2', 'Key words that signal a jurat?', 'Subscribed and sworn; sworn to; affirmed; being duly sworn.', '73', 'core'),
                flashcard('jurat_fc_3', 'Can a non-attorney notary choose a jurat for the signer?', 'No. The notary may explain the difference but cannot advise which act best suits the situation.', '72, 88', 'challenge'),
            ],
            [
                question('jurat_q_1', 'Which wording most clearly signals a jurat?', ['Acknowledged before me', 'Signed as free act and deed', 'Sworn to and subscribed before me', 'True copy certified'], 'C', 'The packet lists “sworn to and subscribed before me” as jurat wording.', '73, 75', False),
                question('jurat_q_2', 'Before completing a jurat certificate, the notary must:', ['Determine the legal sufficiency of the document', 'Administer an oath or affirmation', 'Call the preparer for approval', 'Confirm the signer’s county of residence only'], 'B', 'The packet says a jurat certificate shall state an oath or affirmation was administered.', '72, 80', False),
                question('jurat_q_3', 'If an oath or affirmation is required, the notary should not substitute:', ['An acknowledgment', 'A journal entry', 'A second seal', 'A travel fee'], 'A', 'The packet’s Do Not list says do not take an acknowledgment instead of an oath or affirmation if one is required.', '97', False),
            ],
        ),
        make_module(
            'electronic_vs_ron',
            'Electronic Notarizations vs. RON',
            'The packet draws a bright line between electronic notarizations and remote online notarizations. Do not blur them on the exam.',
            90,
            (81, 84),
            4,
            ['Electronic notarization', 'In-person act', 'Electronic seal', 'RON'],
            [
                'Keep “electronic” and “remote online” separate in your head.',
                'Electronic notarization is still in-person.',
                'RON requires an online notarization system and separate authorization/coursework.',
            ],
            [
                'Assuming all electronic acts are remote.',
                'Forgetting the authenticator certificate concept for electronic documents.',
            ],
            [
                rule('electronic_1', 'Electronic notarizations are not the same as remote online notarizations.', '81-82', True),
                rule('electronic_2', 'An Ohio notary with an active commission may perform electronic notarizations without additional Secretary of State authorization.', '82', True),
                rule('electronic_3', 'An electronic notarization is an in-person act using an electronic signature and electronic seal on a digital document.', '82', True),
                rule('electronic_4', 'Remote online notaries are required to use an online notarization system to perform remote online notarizations.', '84', True),
            ],
            [
                flashcard('electronic_fc_1', 'Is an electronic notarization remote by default?', 'No. It is an in-person act.', '81-82', 'core'),
                flashcard('electronic_fc_2', 'Do commissioned Ohio notaries need extra authorization for basic in-person electronic notarizations?', 'No, not according to the packet.', '82', 'core'),
            ],
            [
                question('electronic_q_1', 'Which statement is true?', ['Electronic notarizations and RON are the same thing', 'An electronic notarization is an in-person act on a digital document', 'RON requires no technology platform', 'Electronic notarizations require the signer to be outside Ohio'], 'B', 'The packet says an electronic notarization is an in-person act using the notary’s electronic signature and seal.', '81-82', False),
                question('electronic_q_2', 'According to the packet, a remote online notary must use:', ['A paper-only journal', 'An online notarization system', 'Only the Secretary of State website', 'No platform if the signer is known personally'], 'B', 'Page 84 says remote online notaries are required to use an online notarization system.', '84', False),
            ],
        ),
        make_module(
            'ron_core_rules',
            'RON Core Rules',
            'The packet’s RON segment focuses on authorization, technology/vendor disclosure, Ohio-location rule for the notary, identity proofing concepts, refusal obligations, journal requirements, and discipline.',
            100,
            (144, 149),
            5,
            ['Credential analysis', 'Identity proofing', 'Dynamic knowledge-based authentication', 'Electronic journal', 'Notary located in Ohio'],
            [
                'Know that the notary must be in Ohio for the act.',
                'Know the application items: platform/vendor, email, decryption instructions, education/testing, fees.',
                'Know the journal/recording requirements and refusal triggers.',
            ],
            [
                'Forgetting that the signer may be outside Ohio, but the notary may not.',
                'Leaving out recording and journal details.',
                'Assuming security concerns are optional instead of refusal triggers.',
            ],
            [
                rule('ron_1', 'A person must complete an approved course and pass a test before being authorized as an online notary public.', '84, 146', True),
                rule('ron_2', 'When applying, the notary must identify the online notarization system and vendor they will use.', '84, 146', True),
                rule('ron_3', 'The online notary must be located in Ohio when performing the remote online notarial act, even if the signer is elsewhere.', '84, 147', True),
                rule('ron_4', 'The packet’s RON definitions include credential analysis, identity proofing, and dynamic knowledge-based authentication.', '145', True),
                rule('ron_5', 'The electronic journal must capture date/time, act type, document type, electronic signatures, full principal name and address, identification method, location, system description, fee, recording, and more — but not a Social Security number.', '148', True),
                rule('ron_6', 'Security, identity, signature issues, or tamper-evident concerns can trigger an obligation to refuse the online act.', '148', True),
                rule('ron_7', 'The packet lists $20 to the Secretary of State and $250 for education/testing in the application requirements segment.', '146', False),
            ],
            [
                flashcard('ron_fc_1', 'Where must the RON notary be physically located during the act?', 'In Ohio.', '84, 147', 'core'),
                flashcard('ron_fc_2', 'Name three RON identity concepts from the packet.', 'Credential analysis, identity proofing, and dynamic knowledge-based authentication.', '145', 'core'),
                flashcard('ron_fc_3', 'What must never be recorded in the electronic journal?', 'A Social Security number.', '148', 'core'),
            ],
            [
                question('ron_q_1', 'A remote online notarization may be performed only when the notary is physically located:', ['Anywhere in the United States', 'In Ohio', 'In the signer’s state', 'In the county where commissioned'], 'B', 'The packet states the RON notary must be located in Ohio for the act.', '84, 147', False),
                question('ron_q_2', 'Which item does the packet specifically include in the electronic journal requirements?', ['The principal’s Social Security number', 'The notary’s favorite vendor', 'How the principal was identified', 'The signer’s credit score'], 'C', 'Page 148 lists how the principal was identified and specifically says not to record an SSN.', '148', False),
                question('ron_q_3', 'Which pair reflects the packet’s listed RON fees/education costs?', ['$5 filing and $30 course', '$20 state fee and $250 education/testing', '$30 filing and $20 course', '$10 state fee and $30 technology fee only'], 'B', 'Page 146 states $20 to the Secretary of State and $250 for education and testing.', '146', False),
            ],
        ),
        make_module(
            'vehicle_title_notarization',
            'Vehicle Title Notarization',
            'Vehicle-title questions are high risk in practice and extremely testable because the packet repeatedly stresses jurats and zero tolerance for incomplete title fields.',
            110,
            (108, 114),
            5,
            ['Assignment of ownership', 'Application for certificate of title', 'Jurat', 'Incomplete title prohibited', 'Dealer exception'],
            [
                'Know the two title sections where notarization may appear.',
                'Remember both seller and buyer title sections are jurats when notarized.',
                'Never notarize an incomplete title section.',
            ],
            [
                'Treating a title act like an acknowledgment instead of a jurat.',
                'Notarizing blanks on the top or bottom half.',
                'Missing the licensed-dealer exception.',
            ],
            [
                rule('title_1', 'The two common title sections are the Assignment of Ownership and the Application for Certificate of Title.', '108', True),
                rule('title_2', 'The Assignment of Ownership requires an affidavit, so the notary must perform a jurat.', '109-110', True),
                rule('title_3', 'The Application for Certificate of Title also requires an affidavit, so the notary must perform a jurat.', '112', True),
                rule('title_4', 'The packet says do not notarize if the title document is incomplete or blank; commission revocation is possible if you do.', '111, 113', True),
                rule('title_5', 'If both parties’ signatures are being notarized, both must sign in your presence and both must receive an oath or affirmation.', '92, 110, 112', True),
                rule('title_6', 'If a licensed Ohio motor vehicle dealer is a party to the transfer, certain title-related documents do not require notarization.', '113-114', False),
            ],
            [
                flashcard('title_fc_1', 'What kind of act is used on Ohio vehicle title affidavit sections?', 'A jurat.', '109, 112', 'core'),
                flashcard('title_fc_2', 'Can you notarize a title section with blanks left incomplete?', 'No.', '111, 113', 'core'),
                flashcard('title_fc_3', 'If both buyer and seller signatures are being notarized on title-related jurats, what must you do?', 'Have both sign in your presence and administer an oath or affirmation to both.', '92, 110, 112', 'challenge'),
            ],
            [
                question('title_q_1', 'The Assignment of Ownership section of an Ohio vehicle title requires which act?', ['Acknowledgment', 'Jurat', 'Copy certification', 'No act is ever required'], 'B', 'The packet states the section is an affidavit and therefore requires a jurat.', '109-110', False),
                question('title_q_2', 'What should a notary do if a vehicle title section is incomplete or blank?', ['Notarize anyway if the signer promises to finish later', 'Refuse to notarize it', 'Notarize but make a note in the journal', 'Call the BMV and proceed'], 'B', 'The packet explicitly says do not notarize incomplete or blank title sections.', '111, 113', False),
            ],
        ),
        make_module(
            'dos_donts_penalties',
            'Dos, Don’ts, Prohibited Acts, and Penalties',
            'This module is essential for passing because the packet’s “Do Not” list is dense and many questions are built straight from it.',
            120,
            (87, 107),
            5,
            ['Do Not', 'Conflict of interest', 'Incomplete document', 'Notario publico', 'Penalties'],
            [
                'Read this section like a red-flag list, not like background reading.',
                'Memorize the prohibited acts that trigger commission discipline.',
                'Separate allowed explanation of acknowledgment vs jurat from forbidden legal advice.',
            ],
            [
                'Notarizing incomplete documents.',
                'Notarizing your own signature or a document in which you have an interest.',
                'Giving legal advice or choosing the notarial act for the signer.',
            ],
            [
                rule('donts_1', 'Do not notarize a document you signed, notarize your own signature, or notarize a transaction in which you have an interest.', '93-94', True),
                rule('donts_2', 'Do not use a name or initial different from the one under which you were commissioned.', '95', True),
                rule('donts_3', 'Do not notarize if the signer is mentally incompetent or appears mentally incapable of understanding the document.', '96', True),
                rule('donts_4', 'Do not alter a written instrument after it has been signed or alter the notarial certificate after the notarization is complete.', '96', True),
                rule('donts_5', 'Do not notarize a signature on an incomplete or blank document.', '87, 97', True),
                rule('donts_6', 'Do not use “notario” or “notario publico” to advertise notary services.', '97', True),
                rule('donts_7', 'Unless you are an Ohio-licensed attorney, do not determine the validity of a power of attorney or prepare/represent another in a legal or administrative proceeding.', '98-99', True),
                rule('donts_8', 'Penalties can include revocation, suspension, admonition, and in some cases permanent ineligibility for reappointment.', '100-101', True),
                rule('donts_9', 'A disqualifying offense must be self-reported to the Secretary of State.', '100', True),
            ],
            [
                flashcard('donts_fc_1', 'Can you notarize your own signature?', 'No.', '93', 'core'),
                flashcard('donts_fc_2', 'Can a non-attorney determine the validity of a POA?', 'No.', '98', 'core'),
                flashcard('donts_fc_3', 'Can you advertise as “notario publico” in Ohio?', 'No.', '97', 'core'),
                flashcard('donts_fc_4', 'Name three possible discipline outcomes.', 'Revocation, suspension, and admonition.', '100-101', 'challenge'),
            ],
            [
                question('donts_q_1', 'A notary should refuse to notarize when the signer appears mentally incapable of understanding the document. True or false?', ['True', 'False', 'Only for title documents', 'Only if the signer is elderly'], 'A', 'The packet says do not notarize if the signer appears mentally incapable of understanding the nature and effect of the document.', '96', False),
                question('donts_q_2', 'Which advertising phrase is specifically prohibited in the packet?', ['Ohio commissioned witness', 'Mobile notary available', 'Notario publico', 'Statewide notary'], 'C', 'The packet says not to use “notario” or “notario publico” in advertising.', '97', False),
                question('donts_q_3', 'Unless licensed as an Ohio attorney, a notary should not:', ['Explain the difference between an acknowledgment and a jurat', 'Determine the validity of a power of attorney', 'Ask for identification', 'Keep a journal'], 'B', 'The packet says non-attorneys must not determine the validity of a POA or other representative-capacity instrument.', '72, 98', False),
                question('donts_q_4', 'A possible penalty for violating Chapter 147 is:', ['Automatic conversion to attorney-notary status', 'Revocation or suspension of the commission', 'Mandatory title licensing', 'Loss of statewide jurisdiction only'], 'B', 'The packet lists revocation, suspension, or admonition as possible outcomes.', '100-101', False),
            ],
        ),
        make_module(
            'law_updates_2025',
            '2025 Updates / HB 315',
            'The packet explicitly isolates the 2025 law updates. Expect questions on the oath change, fee references, prohibited acts, ID/personal-knowledge changes, and notarial certificate updates.',
            130,
            (121, 125),
            4,
            ['HB 315', 'Effective April 4, 2025', 'Oath in person', '147.50', '147.542'],
            [
                'Memorize the effective date and the oath change.',
                'Use this module to confirm which sections were updated in 2025.',
            ],
            [
                'Assuming old pre-2025 habits still control fees or oath procedure.',
                'Skipping the certificate and ID update sections.',
            ],
            [
                rule('updates_1', 'HB 315 was effective April 4, 2025.', '121', True),
                rule('updates_2', 'The packet says a new notary must personally appear before another notary to take the oath prior to completing a notarial act.', '121', True),
                rule('updates_3', 'The 2025 updates call out RON fees/technology fee, prohibited acts, personal knowledge, satisfactory evidence, acceptable ID, conflict of interest, notarial certificates, and electronically notarized documents.', '123-125', True),
            ],
            [
                flashcard('updates_fc_1', 'What bill number does the packet identify for the 2025 notary changes?', 'HB 315.', '121', 'core'),
                flashcard('updates_fc_2', 'What key oath change does the packet highlight?', 'A new notary must personally appear before another notary to take the oath before performing a notarial act.', '121', 'core'),
            ],
            [
                question('updates_q_1', 'The packet says HB 315 became effective on:', ['January 1, 2025', 'April 4, 2025', 'July 1, 2025', 'December 31, 2025'], 'B', 'The 2025 updates section says HB 315 was effective April 4, 2025.', '121', False),
                question('updates_q_2', 'Which change is specifically highlighted in the packet’s 2025 updates?', ['All acknowledgments must be remote', 'A new notary must personally appear before another notary for the oath', 'All journals are abolished', 'The commission term is now three years'], 'B', 'Page 121 calls out the in-person oath requirement for a new notary.', '121', False),
            ],
        ),
        make_module(
            'sample_questions_final_review',
            'Sample Questions + Final Review',
            'Use the packet’s sample questions as a confidence check, then close with a cram sheet and weak-topic review before your live exam.',
            140,
            (115, 120),
            3,
            ['Sample question', 'Random generator', 'Weak topics', 'Final review'],
            [
                'Retake packet sample questions until the right answer feels obvious.',
                'Use missed answers to build your weak-topic list for the cram sheet.',
            ],
            [
                'Stopping at passive reading without testing yourself.',
                'Ignoring why an answer is correct.',
            ],
            [
                rule('review_1', 'The packet says test questions are not shared, so study the rules rather than memorizing only sample items.', '115', True),
                rule('review_2', 'A strong final review should hit term length, fees, identity, acknowledgments versus jurats, title rules, and prohibited acts.', '115-120', True),
            ],
            [
                flashcard('review_fc_1', 'What kind of question generator does the packet say the test uses?', 'A random question generator.', '115', 'core'),
                flashcard('review_fc_2', 'What should you do after missing a question in practice?', 'Review the explanation, revisit the source pages, and add the topic to your weak-topic list.', '115-120', 'core'),
            ],
            [
                question('review_q_1', 'The packet says the exam questions are:', ['Shared in full after you register', 'Generated randomly', 'Written only from the vehicle-title section', 'Always the same in order'], 'B', 'Page 115 says the test uses a random question generator.', '115', False),
                question('review_q_2', 'Which study move best matches the packet and this app’s system?', ['Memorize only the sample answers', 'Ignore missed questions once you score above 50%', 'Use missed questions to identify weak topics and revisit the packet pages', 'Skip practice because the test is random'], 'C', 'The packet provides sample questions and this study system uses them to drive weak-topic review and the cram sheet.', '115-120', False),
            ],
        ),
    ]

    cram_markdown = """
# Ohio Notary Final Cram Sheet

## Test specifics
- 30 questions
- 1 hour
- 80% passing score
- 30-day retake if fail
- Questions are randomly generated

## Core identity of the office
- A notary public is an impartial witness to transactions.
- Do not give legal advice unless you are an Ohio-licensed attorney.
- Check Ohio law for updates; the packet warns the law can change.

## Qualifications / commission basics
- Age 18+
- Legal resident of Ohio (subject to packet exceptions for attorneys)
- BCI report within the preceding 6 months
- Education + test required for non-attorneys
- Commission term: 5 years unless revoked
- Statewide jurisdiction

## Administrative updates to remember
- Track name changes
- Track address changes
- Notice of resignation
- Report disqualifying offenses
- Duplicate commission fee referenced in packet
- Certified copy of commission fee: $5

## Fees
- Up to $5 for a non-online notarial act
- Up to $30 for an online notarial act
- Up to $10 technology fee for online notarization
- Travel fee must be reasonable and agreed to in advance
- Do not charge both traditional and online fees for the same act

## Core notarial steps
1. Verify identity
2. Create journal entry
3. Administer the act
4. Complete the certificate
5. Collect fee

## Appearance + ID
- For non-online acts, the principal must personally appear
- ID must contain photo or signature
- ID must be current or expired less than 3 years
- Personal knowledge / satisfactory evidence rules matter
- Signature by mark: signer must make the mark personally with intent to sign
- Designated alternative signer rules exist for limited physical ability situations

## Certificates
- Every notarial act needs a completed notarial certificate
- If the wrong act type is listed, correct it at no charge
- Non-attorney notary may explain acknowledgment vs jurat but may not advise which one the signer should choose

## Acknowledgment
- Appearance required
- Signer acknowledges executing the instrument
- Ask if it is the signer’s free act and deed
- Key phrase: "acknowledged before me"

## Jurat / affidavit / oath / affirmation
- A jurat requires an oath or affirmation
- Signer signs in your presence
- Key phrases: subscribed and sworn / sworn to / affirmed / being duly sworn
- Do not swap in an acknowledgment when an oath is required

## Electronic notarization vs RON
- Electronic notarization is still in person
- RON is separate
- Electronic notarization uses electronic signature + electronic seal on a digital document

## RON essentials
- Separate course + test + application
- Must use online notarization system / vendor
- Notary must be physically located in Ohio
- Signer may be outside Ohio or the United States
- Identity methods include credential analysis / identity proofing / dynamic knowledge-based authentication
- Maintain electronic journal and recording
- Do not record Social Security numbers in the journal
- Refuse if identity, security, signature, or tamper-evident concerns exist

## Vehicle titles
- Two common sections: Assignment of Ownership and Application for Certificate of Title
- Both affidavit-based sections require a jurat when notarized
- Never notarize incomplete or blank title fields
- If notarizing both parties, both sign in your presence and both receive oath/affirmation
- Dealer exception exists for certain dealer-involved transfers

## Biggest prohibited acts / traps
- Do not notarize your own signature
- Do not notarize a document you signed
- Do not notarize where you have an interest in the transaction
- Do not notarize incomplete or blank documents
- Do not alter the document after it is signed
- Do not alter the certificate after completion
- Do not notarize if signer is mentally incompetent or incapable
- Do not use “notario” or “notario publico”
- Non-attorneys cannot determine validity of a POA or provide legal representation

## Penalties
- Revocation
- Suspension
- Admonition
- Some violations create permanent reappointment problems
- Self-report disqualifying offenses

## 2025 updates / HB 315
- Effective April 4, 2025
- Packet highlights in-person oath before first act for a new notary
- Updated topics include fees, prohibited acts, ID/personal knowledge, certificates, electronic documents

## Final exam strategy
- Know fees exactly
- Know acknowledgment vs jurat difference exactly
- Know appearance + ID rules exactly
- Know title blanks are never okay
- Know the top prohibited acts exactly
- If torn between two answers, choose the one that protects impartiality, personal appearance, proper ID, complete documents, and correct certificate wording
""".strip()

    payload = {
        'metadata': {
            'sourceFileName': source.name,
            'packetDate': PACKET_DATE,
            'pageCount': page_count,
            'documentID': 'ohio-notary-course-packet',
            'documentTitle': 'Ohio Notary Course Packet',
            'contentVersion': '2026-04-07-private-course-build',
            'exam': {
                'questionCount': 30,
                'durationMinutes': 60,
                'passingScorePercent': 80,
                'retakeWindowDays': 30,
            },
            'courseProvider': 'Ohio Notary Services, LLC',
            'privateUseOnly': True,
            'notes': [
                'This private study asset is derived from the paid course packet supplied by the user.',
                'Use the packet and any newer course updates as the source of truth if future materials change.',
            ],
        },
        'modules': modules,
        'cramSheets': [
            {
                'id': 'cram_ohio_notary_final',
                'documentID': 'ohio-notary-course-packet',
                'title': 'Ohio Notary Final Cram Sheet',
                'contentMarkdown': cram_markdown,
            }
        ],
    }
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description='Build the private study content JSON for Notary OS.')
    parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()

    if not source.exists():
        raise SystemExit(f'Missing source PDF: {source}')

    output.parent.mkdir(parents=True, exist_ok=True)
    payload = build_payload(source)
    output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    print(f'Wrote study content to {output}')


if __name__ == '__main__':
    main()
