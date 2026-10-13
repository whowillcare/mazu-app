import docx
import re
import json
import yaml
import os
from pathlib import Path

# Paths
DOCX_INTERNAL = "raw/妈祖60签_中英对照_内部审阅件.docx"
DOCX_EXTERNAL = "raw/妈祖60签_中英对照_对外件.docx"
OUTPUT_DIR_LOTS = Path("data/canonical/lots")
OUTPUT_COMPILED_JSON = Path("data/canonical/lots_compiled.json")
OUTPUT_COMPILED_YAML = Path("data/canonical/lots_compiled.yaml")

OUTPUT_DIR_LOTS.mkdir(parents=True, exist_ok=True)

re_lot_header = re.compile(r'^Lot\s+(\d+)\s*·\s*([^·]+)·\s*(.*)$')
re_story_hdr = re.compile(r'^(.*?)(?:（(主故事 main story|变体 variant)）)?\s*·\s*(.*?)(?:\s*—\s*见第\s*(\d+)\s*签／see Lot\s*\d+)?$')

def extract_paragraphs(docx_path):
    doc = docx.Document(docx_path)
    return [p.text.strip() for p in doc.paragraphs if p.text.strip()]

def split_into_lot_blocks(paragraphs):
    preface = []
    lots = {}
    current_lot = None
    
    for p in paragraphs:
        m = re_lot_header.match(p)
        if m:
            current_lot = int(m.group(1))
            lots[current_lot] = {
                'lot_number': current_lot,
                'header_line': p,
                'ganzhi_raw': m.group(2).strip(),
                'title_en': m.group(3).strip(),
                'lines': []
            }
        elif current_lot is not None:
            lots[current_lot]['lines'].append(p)
        else:
            preface.append(p)
            
    return preface, lots

def parse_register_line(line):
    level_match = re.search(r'register\.level:\s*([a-zA-Z_-]+)', line)
    level = level_match.group(1) if level_match else None
    
    source_match = re.search(r'register\.source:\s*([a-zA-Z_-]+)(?:（(.*?)）)?', line)
    source = source_match.group(1) if source_match else None
    source_note = source_match.group(2) if source_match and source_match.group(2) else None
    
    evidence_match = re.search(r'evidence:\s*(.*)$', line)
    evidence = evidence_match.group(1).strip() if evidence_match else None
    
    return {
        'level': level,
        'source': source,
        'source_note': source_note,
        'evidence': evidence
    }

def parse_question_gate(lines):
    # line 0: question_gate: {...}
    # line 1: · 中: 原问法「...」→ 改写为「...」（...）
    qg_dict = {}
    qg_json_raw = lines[0].replace('question_gate:', '').strip()
    qg_json_valid = re.sub(r'([{,])\s*([a-zA-Z_]+)\s*:', r'\1"\2":', qg_json_raw)
    try:
        qg_dict = json.loads(qg_json_valid)
    except Exception:
        qg_dict = {'raw': qg_json_raw}
        
    zh_info = {}
    if len(lines) > 1:
        m = re.search(r'原问法「(.*?)」→ 改写为「(.*?)」（(.*)）$', lines[1])
        if m:
            zh_info = {
                'rewritten_from': m.group(1).strip(),
                'rewritten_to': m.group(2).strip(),
                'explanation': m.group(3).strip()
            }
        else:
            zh_info = {'raw': lines[1]}
            
    return {
        'scope': qg_dict.get('scope', 'one_matter'),
        'rewritten_from': {
            'en': qg_dict.get('rewritten_from', ''),
            'zh': zh_info.get('rewritten_from', '')
        },
        'rewritten_to': {
            'en': qg_dict.get('rewritten_to', ''),
            'zh': zh_info.get('rewritten_to', '')
        },
        'rewrite_reason': {
            'code': qg_dict.get('rewrite_reason', 'none'),
            'zh_explanation': zh_info.get('explanation', '')
        },
        'blocked': qg_dict.get('blocked', False),
        'disclosed_to_user': qg_dict.get('disclosed_to_user', True)
    }

def parse_guidance(lines):
    guidance = {}
    for line in lines:
        cleaned = line.lstrip('·').strip()
        parts = cleaned.split(':', 1)
        slot = parts[0].strip()
        rest = parts[1].strip() if len(parts) > 1 else ''
        
        compliance_tag = None
        if 'Not financial advice' in rest:
            compliance_tag = 'not_financial_advice'
        elif 'Not medical advice' in rest:
            compliance_tag = 'not_medical_advice'
        elif 'Not legal advice' in rest:
            compliance_tag = 'not_legal_advice'
        elif 'never as a date' in rest:
            compliance_tag = 'seasonal_windows_only'
            
        if '　／　' in rest:
            en, zh = rest.split('　／　', 1)
        elif '／' in rest:
            en, zh = rest.split('／', 1)
        else:
            en, zh = rest, ''
            
        guidance[slot] = {
            'en': en.strip(),
            'zh': zh.strip(),
            'compliance_tag': compliance_tag
        }
    return guidance

def parse_reading_notes(lines):
    notes = []
    for i in range(0, len(lines), 2):
        if i + 1 >= len(lines):
            break
        line_en = lines[i]
        line_zh = lines[i+1]
        
        m_en = re.search(r'·\s*「(.*?)」\s*(?:\((.*?)\))?\s*—\s*(.*)$', line_en)
        m_zh = re.search(r'·\s*中：(?:「(.*?)」)?\s*(.*)$', line_zh)
        
        term = m_en.group(1) if m_en else ''
        pinyin = m_en.group(2) if m_en else ''
        en_text = m_en.group(3) if m_en else line_en
        zh_text = m_zh.group(2) if m_zh else line_zh
        
        notes.append({
            'term': term,
            'pinyin': pinyin,
            'en': en_text.strip(),
            'zh': zh_text.strip()
        })
    return notes

def parse_stories(lines, primary_zh=""):
    stories = []
    current_story = None
    story_body = []
    
    for line in lines:
        sm = re_story_hdr.match(line)
        if sm and ('main story' in line or 'variant' in line or '见第' in line or 'see Lot' in line):
            if current_story:
                current_story['lines'] = story_body
                stories.append(current_story)
            current_story = {
                'title_zh': sm.group(1).strip(),
                'type_raw': sm.group(2),
                'title_en': sm.group(3).strip(),
                'ref_lot': int(sm.group(4)) if sm.group(4) else None
            }
            story_body = []
        elif current_story:
            story_body.append(line)
            
    if current_story:
        current_story['lines'] = story_body
        stories.append(current_story)
        
    formatted = []
    for s in stories:
        is_pri_by_tag = (s['type_raw'] == '主故事 main story')
        is_pri_by_title = bool(primary_zh and (s['title_zh'] in primary_zh or primary_zh in s['title_zh']))
        is_primary = is_pri_by_tag or is_pri_by_title or (len(formatted) == 0 and not any(x.get('type_raw') == '主故事 main story' for x in stories))
        is_variant = not is_primary
        
        s_lines = s.get('lines', [])
        ref_lot = s['ref_lot']
        
        narrative_zh = None
        narrative_en = None
        connection_zh = None
        connection_en = None
        
        if ref_lot:
            # Cross reference story (typically 2 lines: 与签诗 and With the lot poem)
            for l in s_lines:
                if l.startswith('与签诗：'):
                    connection_zh = l.replace('与签诗：', '').strip()
                elif l.startswith('With the lot poem:'):
                    connection_en = l.replace('With the lot poem:', '').strip()
        else:
            # Standard 4-line story
            idx = 0
            if len(s_lines) >= 1 and not s_lines[0].startswith('与签诗：'):
                narrative_zh = s_lines[0]
                idx += 1
            if len(s_lines) >= 2 and not s_lines[1].startswith('With the lot poem:') and not s_lines[1].startswith('与签诗：'):
                narrative_en = s_lines[1]
                idx += 1
            for l in s_lines[idx:]:
                if l.startswith('与签诗：'):
                    connection_zh = l.replace('与签诗：', '').strip()
                elif l.startswith('With the lot poem:'):
                    connection_en = l.replace('With the lot poem:', '').strip()
                    
        formatted.append({
            'title': {
                'zh': s['title_zh'],
                'en': s['title_en']
            },
            'is_primary': is_primary,
            'is_variant': is_variant,
            'cross_reference_lot': ref_lot,
            'narrative': {
                'zh': narrative_zh,
                'en': narrative_en
            } if narrative_zh or narrative_en else None,
            'poem_connection': {
                'zh': connection_zh,
                'en': connection_en
            }
        })
        
    return formatted

def parse_lot(lot_num, int_data, ext_data):
    int_lines = int_data['lines']
    ext_lines = ext_data['lines']
    
    # 1. Ganzhi and Title
    # ganzhi_raw format: 甲子（Jia-zi）
    m_gz = re.search(r'([^\s（(]+)[（(]([^）)]+)[）)]', int_data['ganzhi_raw'])
    ganzhi_zh = m_gz.group(1).strip() if m_gz else int_data['ganzhi_raw']
    ganzhi_pinyin = m_gz.group(2).strip() if m_gz else ""
    title_en = int_data['title_en'].strip()
    
    # Extract metadata before Verse
    def slice_sections(lines):
        sections = {
            'meta': [],
            'verse': [],
            'keywords': [],
            'reading_notes': [],
            'plain_meaning': [],
            'question_gate': [],
            'guidance': [],
            'stories': []
        }
        current_sec = 'meta'
        for l in lines:
            if 'Verse (签诗)' in l:
                current_sec = 'verse'
                continue
            elif 'Keyword clusters' in l:
                current_sec = 'keywords'
                continue
            elif 'Reading notes' in l:
                current_sec = 'reading_notes'
                continue
            elif 'Plain meaning' in l:
                current_sec = 'plain_meaning'
                continue
            elif 'Question gate' in l:
                current_sec = 'question_gate'
                continue
            elif 'Guidance' in l:
                current_sec = 'guidance'
                continue
            elif 'Extended reading' in l:
                current_sec = 'stories'
                continue
            sections[current_sec].append(l)
        return sections

    sec_int = slice_sections(int_lines)
    sec_ext = slice_sections(ext_lines)
    
    # --- Parse Metadata ---
    meta_int = sec_int['meta']
    meta_ext = sec_ext['meta']
    
    # Hexagram
    hex_info = {}
    for l in meta_int:
        if l.startswith('· 卦 Hexagram:'):
            content = l.replace('· 卦 Hexagram:', '').strip()
            code_match = re.search(r'—\s*code\s*([○●]+)', content)
            code = code_match.group(1) if code_match else None
            shared_match = re.search(r'shared with Lot (\d+)', content)
            shared_lot = int(shared_match.group(1)) if shared_match else None
            main_part = content.split('— code')[0].strip()
            parts = main_part.split(None, 1)
            zh_name = parts[0] if parts else ""
            rest = parts[1] if len(parts) > 1 else ""
            hex_info = {
                'zh': zh_name,
                'name_and_structure_en': rest,
                'binary_code': code,
                'shared_with_lot': shared_lot,
                'disclosure': {
                    'en': "Sixty lots map to fifty-four hexagrams: six hexagrams are shared by two lots each, and ten hexagrams are not used at all.",
                    'zh': "60 支映射 54 卦（6 卦各两支共用、10 卦未用），不是一签一卦。"
                }
            }
            break
            
    # Element & Direction
    elem_info = {}
    for l in meta_int:
        if l.startswith('· 五行方位 Element & direction:'):
            rest = l.replace('· 五行方位 Element & direction:', '').strip()
            if '　／　' in rest:
                ezh, een = rest.split('　／　', 1)
            elif '／' in rest:
                ezh, een = rest.split('／', 1)
            else:
                ezh, een = rest, ""
            elem_info = {
                'zh': ezh.strip(),
                'en': een.strip()
            }
            break
            
    # Story group summary line
    sg_meta = {}
    for l in meta_int:
        if l.startswith('· 故事群 Story group'):
            m_cnt = re.search(r'\((\d+)\)', l)
            cnt = int(m_cnt.group(1)) if m_cnt else None
            m_pri = re.search(r'主\s*primary\s*([^*]+)\s*\*(.*?)\*', l)
            pri_zh = m_pri.group(1).strip() if m_pri else ""
            pri_en = m_pri.group(2).strip() if m_pri else ""
            sg_meta['total_count'] = cnt
            sg_meta['primary'] = {'zh': pri_zh, 'en': pri_en}
        elif l.startswith('· 变体（英）variants (EN):'):
            raw_v_en = l.replace('· 变体（英）variants (EN):', '').strip()
            sg_meta['variants_en'] = [v.strip().strip('*') for v in raw_v_en.split(';') if v.strip()]
        elif l.startswith('· 变体（中·故事组全列）variants (ZH):'):
            raw_v_zh = l.replace('· 变体（中·故事组全列）variants (ZH):', '').strip()
            sg_meta['variants_zh'] = [v.strip() for v in re.split(r'[,、]', raw_v_zh) if v.strip()]

    # Register (Tone) - Merged & Flagged!
    reg_line_int = next((l for l in meta_int if l.startswith('· register.level:')), "")
    reg_line_ext = next((l for l in meta_ext if l.startswith('· register.level:')), "")
    reg_parsed_int = parse_register_line(reg_line_int)
    reg_parsed_ext = parse_register_line(reg_line_ext)
    
    register = {
        'level': reg_parsed_ext['level'] or reg_parsed_int['level'],
        'source': reg_parsed_ext['source'] or reg_parsed_int['source'],
        'internal': {
            'visibility': 'internal',
            'audience': 'admin_and_internal_audit_only',
            'source_note': reg_parsed_int['source_note'],
            'evidence': reg_parsed_int['evidence']
        },
        'external': {
            'visibility': 'public',
            'audience': 'all_users',
            'source_note': reg_parsed_ext['source_note'],
            'evidence': reg_parsed_ext['evidence']
        }
    }
    
    # Criteria (判据) - Merged & Flagged!
    crit_line_int = next((l for l in meta_int if '判据（中·内部件' in l), "")
    crit_line_ext = next((l for l in meta_ext if '判据（中·对外件' in l), "")
    
    criteria = {
        'internal': {
            'visibility': 'internal',
            'audience': 'admin_and_internal_audit_only',
            'description_zh': '照抄庙本解曰（庙方原文，供核验）',
            'raw_temple_text': crit_line_int.split(':', 1)[1].strip() if ':' in crit_line_int else crit_line_int
        },
        'external': {
            'visibility': 'public',
            'audience': 'all_users',
            'description_zh': '我方概括（合规发布用）',
            'summary_zh': crit_line_ext.split(':', 1)[1].strip() if ':' in crit_line_ext else crit_line_ext
        }
    }
    
    # Notes, Provenance, Review date
    editorial_note = next((l.replace('· 注:', '').strip() for l in meta_int if l.startswith('· 注:')), None)
    provenance = next((l.replace('· 校订 Provenance:', '').strip() for l in meta_int if l.startswith('· 校订 Provenance:')), None)
    review_date = next((re.search(r'reviewed_on:\s*(\S+)', l).group(1) for l in meta_int if 'reviewed_on:' in l), "2026-10-06")

    # --- Parse Verse ---
    verse_lines = []
    for idx, vl in enumerate(sec_int['verse'], start=1):
        if '　／　' in vl:
            vzh, ven = vl.split('　／　', 1)
        elif '／' in vl:
            vzh, ven = vl.split('／', 1)
        else:
            vzh, ven = vl, ""
        verse_lines.append({
            'line_number': idx,
            'zh': vzh.strip(),
            'en': ven.strip()
        })
        
    # --- Parse Keyword Clusters ---
    fav_line = next((l for l in sec_int['keywords'] if 'FAVOURABLE:' in l), "")
    grd_line = next((l for l in sec_int['keywords'] if 'GUARDED:' in l), "")
    
    def parse_kc(line):
        rest = re.sub(r'·\s*(吉 FAVOURABLE|忌 GUARDED):\s*', '', line)
        if '　／　' in rest:
            en_str, zh_str = rest.split('　／　', 1)
        elif '／' in rest:
            en_str, zh_str = rest.split('／', 1)
        else:
            en_str, zh_str = rest, ""
        return {
            'en': [k.strip() for k in en_str.split('·') if k.strip()],
            'zh': [k.strip() for k in zh_str.split('·') if k.strip()]
        }

    keywords = {
        'favourable': parse_kc(fav_line),
        'guarded': parse_kc(grd_line)
    }

    # --- Parse Reading Notes ---
    reading_notes = parse_reading_notes(sec_int['reading_notes'])
    
    # --- Parse Plain Meaning ---
    pm_en_line = next((l for l in sec_int['plain_meaning'] if l.startswith('· EN:')), "")
    pm_zh_line = next((l for l in sec_int['plain_meaning'] if l.startswith('· 中:')), "")
    plain_meaning = {
        'en': pm_en_line.replace('· EN:', '').strip(),
        'zh': pm_zh_line.replace('· 中:', '').strip()
    }
    
    # --- Parse Question Gate ---
    question_gate = parse_question_gate(sec_int['question_gate'])
    
    # --- Parse Guidance ---
    guidance = parse_guidance(sec_int['guidance'])
    
    # --- Parse Stories ---
    stories = parse_stories(sec_int['stories'], sg_meta.get('primary', {}).get('zh', ''))

    # Assemble canonical unified record
    lot_record = {
        'id': lot_num,
        'lot_number': lot_num,
        'ganzhi': {
            'zh': ganzhi_zh,
            'pinyin': ganzhi_pinyin
        },
        'title': {
            'en': title_en,
            'zh': sg_meta.get('primary', {}).get('zh', '')
        },
        'hexagram': hex_info,
        'element_and_direction': elem_info,
        'story_group_summary': sg_meta,
        'register': register,
        'criteria': criteria,
        'provenance': {
            'editorial_note': editorial_note,
            'textual_provenance': provenance,
            'reviewed_on': review_date
        },
        'verse': {
            'classical_form': '七言絕句 (7-character quatrain)',
            'english_style': 'unrhymed cadence',
            'lines': verse_lines
        },
        'keywords': keywords,
        'reading_notes': reading_notes,
        'plain_meaning': plain_meaning,
        'question_gate': question_gate,
        'guidance': guidance,
        'stories': stories
    }
    
    return lot_record

def main():
    print("Extracting paragraphs from DOCX files...")
    int_p = extract_paragraphs(DOCX_INTERNAL)
    ext_p = extract_paragraphs(DOCX_EXTERNAL)
    
    print(f"Internal: {len(int_p)} paragraphs, External: {len(ext_p)} paragraphs.")
    
    _, int_lots = split_into_lot_blocks(int_p)
    _, ext_lots = split_into_lot_blocks(ext_p)
    
    compiled_lots = []
    
    print("Processing and merging all 60 lots...")
    for num in range(1, 61):
        record = parse_lot(num, int_lots[num], ext_lots[num])
        compiled_lots.append(record)
        
        # Save individual YAML file
        out_yaml_file = OUTPUT_DIR_LOTS / f"lot_{num:02d}.yaml"
        with open(out_yaml_file, 'w', encoding='utf-8') as f:
            yaml.dump(record, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
            
    print(f"Saved 60 individual YAML files to {OUTPUT_DIR_LOTS}/")
    
    # Save compiled JSON
    with open(OUTPUT_COMPILED_JSON, 'w', encoding='utf-8') as f:
        json.dump({
            'version': '1.0.0',
            'tradition': 'Sixty Jiazi Lots of the Mazu Temple Tradition (六十甲子媽祖靈籤)',
            'total_lots': len(compiled_lots),
            'lots': compiled_lots
        }, f, ensure_ascii=False, indent=2)
    print(f"Saved compiled JSON to {OUTPUT_COMPILED_JSON}")

    # Save compiled YAML
    with open(OUTPUT_COMPILED_YAML, 'w', encoding='utf-8') as f:
        yaml.dump({
            'version': '1.0.0',
            'tradition': 'Sixty Jiazi Lots of the Mazu Temple Tradition (六十甲子媽祖靈籤)',
            'total_lots': len(compiled_lots),
            'lots': compiled_lots
        }, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
    print(f"Saved compiled YAML to {OUTPUT_COMPILED_YAML}")
    print("All tasks completed successfully!")

if __name__ == '__main__':
    main()
