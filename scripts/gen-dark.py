# -*- coding: utf-8 -*-
# Reads src/styles/skin-light.css and writes dark-mode overrides for every hard-coded light colour.
import io,re
src=io.open('src/styles/skin-light.css',encoding='utf-8').read()
src=re.sub(r'/\*.*?\*/','',src,flags=re.S)

def parse(text):
    """returns list of (kind, header, body) where kind is 'rule' or 'at'"""
    out=[]; i=0; n=len(text)
    while i<n:
        j=text.find('{',i)
        if j<0: break
        head=text[i:j].strip()
        depth=1; k=j+1
        while k<n and depth:
            if text[k]=='{': depth+=1
            elif text[k]=='}': depth-=1
            k+=1
        body=text[j+1:k-1]
        out.append(('at' if head.startswith('@') else 'rule', head, body))
        i=k
    return out

WHITE=re.compile(r'(?<![\w-])(#fff(?:fff)?|white)(?![\w-])',re.I)
def convert_decl(prop,val):
    p=prop.strip().lower(); v=val.strip()
    imp=' !important' if '!important' in v else ''
    core=v.replace('!important','').strip()
    if p in ('background','background-color'):
        if WHITE.fullmatch(core): return 'var(--surface)'+imp
        if 'gradient' in core and WHITE.search(core): return WHITE.sub('var(--bg)',core)+imp
        if core.lower() in ('#f3f7fd','#f0f9ff'): return 'var(--surface-2)'+imp
        return None
    if p=='color':
        m={'#0b1220':'var(--ink)','#111827':'var(--ink)','#1e293b':'var(--ink-2)','#334155':'var(--ink-2)','#475569':'var(--muted)','#64748b':'var(--muted)','var(--accent-blue)':'var(--link-blue)'}
        return (m[core.lower()]+imp) if core.lower() in m else None
    if p.startswith('border') or p=='outline':
        if re.search(r'#dbe3ee|#c7d6f3|#94a3b8',core,re.I):
            return re.sub(r'#dbe3ee|#c7d6f3|#94a3b8','var(--line)',core,flags=re.I)+imp
        return None
    if p=='box-shadow' and re.search(r'0 0 0 1px rgb\(11 18 32',core): return None
    return None

# sections that are already dark by design (hero, Constitution band, footer, the live strip) are left alone
SKIP_SEL=re.compile(r'hero-full|hero-photo|hero-facts|\.hf\b|\.hf-|\.band\b|band-facts|site-footer|footer-|ticker-mobile|hero-badge|status-pill|hero-by|hero-sub|hero-stats')
PAGE_BG=re.compile(r'(^|\s)(body|main)$|\.site-header$|\.hero$|\.home-why$|\.home-ask$|\.docs$|\.section$')
def darksel(sel):
    parts=[]
    for s in sel.split(','):
        s=s.strip()
        if not s: continue
        if s.startswith("[data-skin='light']"):
            s="[data-skin='light'][data-theme='dark']"+s[len("[data-skin='light']"):]
        elif s.startswith(':root') or s.startswith('html'):
            continue
        else:
            s="[data-skin='light'][data-theme='dark'] "+s
        parts.append(s)
    return ', '.join(parts)

FINAL={}
def collect(items,ctx=''):
    for kind,head,body in items:
        if kind=='at':
            if head.startswith('@media') or head.startswith('@supports'): collect(parse(body),ctx+head)
            continue
        for d in body.split(';'):
            if ':' not in d: continue
            prop,val=d.split(':',1); prop=prop.strip().lower()
            if prop=='background-color': prop='background'
            for sel in head.split(','):
                FINAL[(ctx,sel.strip(),prop)]=val.strip()
        
def emit(items,indent='',ctx=''):
    lines=[]
    for kind,head,body in items:
        if kind=='at':
            if head.startswith('@media') or head.startswith('@supports'):
                inner=emit(parse(body),indent+'  ',ctx+head)
                if inner: lines.append(indent+head+' {\n'+inner+'\n'+indent+'}')
            continue
        for one in [x.strip() for x in head.split(',') if x.strip()]:
            if SKIP_SEL.search(one): continue
            decls=[]
            for d in body.split(';'):
                if ':' not in d: continue
                prop,val=d.split(':',1); key=prop.strip().lower()
                if key=='background-color': key='background'
                if FINAL.get((ctx,one,key),val.strip())!=val.strip(): continue  # a later rule replaces this value
                nv=convert_decl(prop,val)
                if nv:
                    if key=='background' and PAGE_BG.search(one): nv=nv.replace('var(--surface)','var(--bg)')
                    decls.append(prop.strip()+': '+nv)
            if decls:
                sel=darksel(one)
                if sel: lines.append(indent+sel+' { '+'; '.join(decls)+'; }')
    return '\n'.join(lines)

collect(parse(src))
body=emit(parse(src))
head="""/* =====================================================================
   Dark mode for the light design. Active when <html data-skin="light" data-theme="dark">.
   The token block is written by hand; the rules after it are generated from skin-light.css
   (scripts/gen-dark.py): every hard-coded white background, dark text colour and light border
   gets its dark-token equivalent. The white design itself is unchanged.
   ===================================================================== */
[data-skin='light'][data-theme='dark'] {
  --bg: #0b111d; --surface: #111a2a; --surface-2: #16213a;
  --paper: #0b111d; --paper-2: #111a2a; --paper-3: #16213a;
  --sky-50: #111a2a; --sky-100: #18243c;
  --ink: #e6edf8; --ink-2: #c9d4e5; --muted: #95a5bd;
  --line: #24324c;
  --accent-blue: #3a6bf2; --accent-blue-dark: #2c58d6; --link-blue: #8eb1ff;
  --link: #8eb1ff; --accent: #8eb1ff; --earth: #8eb1ff;
  --chip-bg: #18243c; --chip-ink: #e6edf8;
  color-scheme: dark;
}
[data-skin='light']:not([data-theme='dark']) { --link-blue: var(--accent-blue); }
[data-skin='light'][data-theme='dark'] body { background: var(--bg); color: var(--ink); }

/* ---------- generated ---------- */
"""
io.open('src/styles/skin-light-dark.gen.css','w',encoding='utf-8').write(head+body+'\n')
print(len(body.split('\n')),'generated lines')
