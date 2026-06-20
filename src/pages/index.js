import React, { useState } from 'react';
import Layout from '@/components/Layout';

const ALL_REPOS = [
  "wwaiyyee/wwaiyyee",
  "wwaiyyee/twinkle",
  "Cedctf/fyp",
  "TisuPaper/kitahack",
  "KangYan23/somnia",
  "Jay-366/hackmoney",
  "Avoisavo/Twinkle",
  "Jay-366/ethonline",
  "Jay-366/techtrove2.0",
  "wwaiyyee/vhack",
  "wwaiyyee/cursor-landing",
  "TeeeeeTeeeee/TeeTee-v2",
  "Cedctf/ethclbet",
  "Avoisavo/Taylorshacks-",
  "Cedctf/catching",
  "Cedctf/foodbridge",
  "wwaiyyee/klmap",
  "wwaiyyee/3dmap",
  "wwaiyyee/kismet"
];

export default function Home() {
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');

  const filteredRepos = ALL_REPOS.filter(repo => 
    repo.toLowerCase().includes(repoSearch.toLowerCase())
  );
  
  const displayedRepos = showAllRepos ? filteredRepos : filteredRepos.slice(0, 7);

  return (
    <Layout>
      <style jsx global>{`
        .repo-link {
          color: var(--color-fg-default) !important;
          text-decoration: none;
        }
        .repo-link:hover {
          text-decoration: underline !important;
        }
      `}</style>
      {/* Left Sidebar */}
      <aside 
        style={{
          width: '260px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg-default)' }}>Top repositories</h2>
            <button style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--color-on-surface)', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>
              New
            </button>
          </div>
          
          <input 
            type="text" 
            placeholder="Find a repository..." 
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'var(--color-bg-default)',
              border: 'var(--border-thin) solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-fg-default)',
              marginBottom: 'var(--space-3)',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px' 
          }}>
            {displayedRepos.map((repo, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--color-border-default)' }}></div>
                <a href={`/client/${repo.split('/')[0]}`} className="repo-link" style={{ fontSize: '14px' }}>{repo}</a>
              </div>
            ))}
          </div>
          
          {!showAllRepos && filteredRepos.length > 7 && (
            <button 
              onClick={() => setShowAllRepos(true)}
              style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: 'var(--color-fg-muted)', 
                marginTop: '16px', 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Show more
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)'
        }}
      >
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>Home</h1>
        
        <div style={{
          border: 'var(--border-thin) solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-default)'
        }}>
          <div style={{
             padding: 'var(--space-3)',
             borderBottom: 'var(--border-thin) solid var(--color-border-default)'
          }}>
             <input 
                type="text" 
                placeholder="Ask anything or type @ to add context" 
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 'var(--text-md)',
                  color: 'var(--color-fg-default)'
                }} 
              />
          </div>
          
          <div style={{ display: 'flex', padding: 'var(--space-2) var(--space-3)', gap: '8px', alignItems: 'center' }}>
            <button style={{ background: 'var(--color-bg-muted)', border: 'var(--border-thin) solid var(--color-border-default)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--color-fg-default)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Ask ▾</button>
            <button style={{ background: 'var(--color-bg-muted)', border: 'var(--border-thin) solid var(--color-border-default)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--color-fg-default)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>All repositories ▾</button>
            <button style={{ background: 'transparent', border: 'var(--border-thin) dashed var(--color-border-default)', color: 'var(--color-fg-muted)', width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
            
            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-fg-muted)' }}>Auto ▾</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-fg-muted)', display: 'flex', alignItems: 'center' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', borderTop: 'var(--border-thin) solid var(--color-border-default)', padding: 'var(--space-2) var(--space-3)', gap: '8px', overflowX: 'auto' }}>
            {['Agent', 'Create issue', 'Spark', 'Git ▾', 'Pull requests ▾'].map(btn => (
               <button key={btn} style={{ background: 'transparent', border: 'var(--border-thin) solid var(--color-border-default)', padding: '6px 16px', borderRadius: 'var(--radius-full)', color: 'var(--color-fg-default)', fontSize: '13px', whiteSpace: 'nowrap', cursor: 'pointer' }}>{btn}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>Feed</h2>
            <button style={{ background: 'var(--color-bg-muted)', border: 'var(--border-thin) solid var(--color-border-default)', padding: '6px 12px', borderRadius: 'var(--radius-md)', color: 'var(--color-fg-default)', fontSize: '13px', cursor: 'pointer' }}>≡ Filter</button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: 'var(--space-3)' }}>📈 Recent client activity</div>
          
          {/* Feed Card 1 */}
          <div style={{
            border: 'var(--border-thin) solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-default)',
            marginBottom: 'var(--space-3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-border-default)' }}></div>
              <a href="#" style={{ fontSize: '14px', color: 'var(--color-fg-link)' }}>005511/LimWeiMing</a>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg-default)', marginBottom: '8px' }}>Updated Living Trust Document</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-fg-default)', marginBottom: '16px' }}>Added new clauses regarding digital assets and cryptocurrency holdings.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}>Draft</span>
                 <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}>Legal</span>
               </div>
               <span style={{ fontSize: '12px', color: 'var(--color-fg-muted)' }}>2 hours ago</span>
            </div>
          </div>
          
          {/* Feed Card 2 */}
          <div style={{
            border: 'var(--border-thin) solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-default)',
            marginBottom: 'var(--space-3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-border-default)' }}></div>
              <a href="#" style={{ fontSize: '14px', color: 'var(--color-fg-link)' }}>005515/DavidNg</a>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg-default)', marginBottom: '8px' }}>Board Meeting Notes Uploaded</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-fg-default)', marginBottom: '16px' }}>Summary of succession planning decisions from Q3 board meeting.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}>Corporate</span>
               </div>
               <span style={{ fontSize: '12px', color: 'var(--color-fg-muted)' }}>Yesterday</span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside 
        style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{
          border: 'var(--border-thin) solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-default)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 'var(--weight-semibold)' }}>Today's Schedule</h3>
             <span style={{ fontSize: '12px', color: 'var(--color-fg-muted)' }}>Sat, Jun 20</span>
          </div>
          
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ width: '40px', fontSize: '12px', fontWeight: 'var(--weight-medium)', textAlign: 'right', marginTop: '2px' }}>10:00<br/><span style={{color:'var(--color-fg-muted)', fontSize:'10px'}}>AM</span></div>
               <div style={{ flex: 1, backgroundColor: 'var(--color-bg-muted)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--color-fg-link)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'var(--weight-semibold)' }}>FIRE Strategy Review</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-fg-muted)', margin: '4px 0' }}>👤 005515/DavidNg</div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(9, 105, 218, 0.1)', color: 'var(--color-fg-link)', padding: '2px 6px', borderRadius: '4px' }}>ZOOM</span>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ width: '40px', fontSize: '12px', fontWeight: 'var(--weight-medium)', textAlign: 'right', marginTop: '2px' }}>01:30<br/><span style={{color:'var(--color-fg-muted)', fontSize:'10px'}}>PM</span></div>
               <div style={{ flex: 1, backgroundColor: 'var(--color-bg-muted)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--color-fg-link)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'var(--weight-semibold)' }}>Trust Fund Signing</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-fg-muted)', margin: '4px 0' }}>👤 005514/JenniferKoh</div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(9, 105, 218, 0.1)', color: 'var(--color-fg-link)', padding: '2px 6px', borderRadius: '4px' }}>IN-PERSON</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ width: '40px', fontSize: '12px', fontWeight: 'var(--weight-medium)', textAlign: 'right', marginTop: '2px' }}>04:00<br/><span style={{color:'var(--color-fg-muted)', fontSize:'10px'}}>PM</span></div>
               <div style={{ flex: 1, backgroundColor: 'var(--color-bg-muted)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--color-fg-link)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'var(--weight-semibold)' }}>Estate Exit Update</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-fg-muted)', margin: '4px 0' }}>👤 005511/LimWeiMing</div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(9, 105, 218, 0.1)', color: 'var(--color-fg-link)', padding: '2px 6px', borderRadius: '4px' }}>TEAMS</span>
               </div>
            </div>
            
            <button style={{ width: '100%', marginTop: '8px', padding: '8px', backgroundColor: 'transparent', border: 'var(--border-thin) solid var(--color-border-default)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 'var(--weight-medium)', cursor: 'pointer', color: 'var(--color-fg-default)' }}>Open full calendar</button>
          </div>
        </div>

        <div style={{
          border: 'var(--border-thin) solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          backgroundColor: 'var(--color-bg-default)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'var(--weight-semibold)', marginBottom: '8px' }}>Client Portal Analytics</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '12px' }}>3 clients viewed their estate plans today.</p>
          <a href="#" style={{ fontSize: '13px', color: 'var(--color-fg-link)' }}>View report →</a>
        </div>
      </aside>
    </Layout>
  );
}
