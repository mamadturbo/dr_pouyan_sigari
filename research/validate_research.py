from pathlib import Path
import json,csv,hashlib,re,collections
R=Path(__file__).resolve().parent
required=['site-content-audit.md','identity-verification.md','sources.csv','findings.json','research-report-fa.md','proposed-site-content-fa.md','publications.json','media-inventory.csv','missing-and-questions.md']
for name in required:assert (R/name).stat().st_size>100,name
sources=list(csv.DictReader((R/'sources.csv').open(encoding='utf-8-sig')))
ids={x['source_id'] for x in sources};assert len(ids)==len(sources)
findings=json.loads((R/'findings.json').read_text(encoding='utf-8'))
coverage=json.loads((R/'coverage.json').read_text(encoding='utf-8'))
pubs=json.loads((R/'publications.json').read_text(encoding='utf-8'))
statuses={'تأییدشده','تأیید محدود','متعارض','یافت‌نشده','نیازمند تأیید پزشک'}
for f in findings:
    assert all(k in f for k in ['claim','value','source_ids','confidence','verification_status','relevant_page','notes'])
    assert set(f['source_ids'])<=ids
    assert f['verification_status'] in statuses
    if f['verification_status']=='تأییدشده':assert f['source_ids'] and f['value'] is not None
assert len({f['id'] for f in findings})==len(findings)==len(coverage)
for p in pubs:
    assert p['authors'] and p['identity_evidence'] and set(p['source_ids'])<=ids
    assert p['attribution_status'] in statuses
    if p['doi']:assert re.fullmatch(r'10\.\d{4,9}/\S+',p['doi'])
assert [p['legacy_id'] for p in pubs[:3]]==['research-1','research-2','research-3']
assert pubs[1]['authors'][0]=='Pouyan Sigari' and pubs[2]['authors'][-1]=='Pouyan Sigari'
assert pubs[2]['corresponding_author']=='Pouyan Sigari'
for p in R.glob('*.md'):
    for sid in re.findall(r'\b(?:S\d{2}|L\d{2})\b',p.read_text(encoding='utf-8')):assert sid in ids,(p,sid)
baseline=json.loads((R/'evidence/site-baseline-sha256.json').read_text())
changed=[name for name,h in baseline.items() if not (R.parent/name).exists() or hashlib.sha256((R.parent/name).read_bytes()).hexdigest()!=h]
assert not changed,changed
result=dict(date='2026-10-28',required_files=required,source_count=len(sources),finding_count=len(findings),coverage_count=len(coverage),publication_count=len(pubs),media_count=len(list(csv.DictReader((R/'media-inventory.csv').open(encoding='utf-8-sig')))),status_counts=dict(collections.Counter(x['verification_status'] for x in findings)),checked_site_file_count=len(baseline),changed_site_files=changed,all_source_references_resolve=True,checks_passed=True)
(R/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
