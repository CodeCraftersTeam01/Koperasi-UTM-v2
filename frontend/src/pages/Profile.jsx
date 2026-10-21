import React, { useState, useEffect } from 'react';
import { apiFetch, getApiUrl, AVATAR_IMG } from '../utils/api';
import LazyImage from '../components/LazyImage';

const Profile = () => {
  const [pengurusList, setPengurusList] = useState([]);
  const [settings, setSettings] = useState({
    about_tag: 'Tentang Kami',
    about_title: 'Koperasi Universitas Trunojoyo Madura',
    about_desc: 'Koperasi UTM berdiri sebagai wadah pengembangan ekonomi mahasiswa di lingkungan Universitas Trunojoyo Madura. Berawal dari keprihatinan terhadap mahalnya harga kebutuhan pokok di sekitar kampus, sekelompok mahasiswa berinisiatif mendirikan koperasi yang menyediakan kebutuhan sehari-hari dengan harga terjangkau.\n\nSejak tahun 1997, Koperasi UTM telah berkembang menjadi salah satu unit kegiatan mahasiswa yang aktif dan memberikan manfaat nyata bagi seluruh civitas akademika UTM, termasuk mahasiswa, dosen, dan tenaga kependidikan.\n\nKami berkomitmen untuk terus berinovasi dalam memberikan pelayanan terbaik, mendukung ekonomi kreatif mahasiswa, dan memperkuat kebersamaan di lingkungan kampus.',
    visi: 'Koperasi UTM menjadi Koperasi Nasional.',
    misi: 'Memberi Layanan, Menyediakan Produk, Jasa serta Kebutuhan Anggota.\nMembantu Menciptakan Peluang Usaha Bagi Anggota.\nMenjadi Organisasi yang Transparan dengan Good Corporate Governance.',
    galeri_judul: 'Galeri Kegiatan',
    galeri_deskripsi: 'Dokumentasi kegiatan dan aktivitas Koperasi UTM di lingkungan Universitas Trunojoyo Madura.',
    galeri_items: '[]',
  });

  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const [pengurusRes, settingsRes] = await Promise.all([
          apiFetch('/api/pengurus'),
          apiFetch('/api/settings'),
        ]);

        if (pengurusRes.ok) {
          const pengurusData = await pengurusRes.json();
          setPengurusList(pengurusData || []);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(prev => ({ ...prev, ...settingsData }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [viewMode, setViewMode] = useState('bagan');
  const [selectedMember, setSelectedMember] = useState(null);

  const defaultPengurus = [
    { id: 1, nama: 'FAIDAL, S.E., M.M.', jabatan: 'KETUA KOPERASI', level: 1, foto: 'img/pengurus/FAIDAL.jpeg' },
    { id: 2, nama: 'R. SRI KENTJANAWATI', jabatan: 'PENGAWAS', level: 2, foto: 'img/pengurus/R SRI KENTJANAWATI.jpeg' },
    { id: 3, nama: 'R. AYU FAUZIYAH F.', jabatan: 'SEKRETARIS', level: 2, foto: 'img/pengurus/R AYU FAUZIYAH FIERDAUS.jpeg' },
    { id: 4, nama: 'TRIMULYANI BUDIAINGSIH', jabatan: 'BENDAHARA', level: 2, foto: 'img/pengurus/TRIMULYANI BUDIANINGSIH.jpeg' },
    { id: 5, nama: 'ABD. HALIM', jabatan: 'DIVISI USAHA', level: 3, foto: 'img/pengurus/ABD HALIM.jpeg' },
    { id: 6, nama: 'ANISAH', jabatan: 'DIVISI USAHA', level: 3, foto: 'img/pengurus/ANISAH.jpeg' },
    { id: 7, nama: 'MOH. AJIB', jabatan: 'DIVISI PERLENGKAPAN', level: 3, foto: 'img/pengurus/MOH AJIB.jpeg' },
    { id: 8, nama: 'FEBRI ANGGA SAPUTRA', jabatan: 'MANAJER SIMPAN PINJAM DAN JASA', level: 4, foto: 'img/pengurus/FEBRI ANGGA SAPUTRA.jpeg' },
    { id: 9, nama: 'APRILIA CHAIRANI SAPUTRI', jabatan: 'MANAJER PERTOKOAN', level: 4, foto: null }
  ];

  const activeList = pengurusList.length > 0 ? pengurusList : defaultPengurus;

  // Preload and decode all pengurus photos in background so modal and grid views render instantaneously
  useEffect(() => {
    if (activeList.length > 0) {
      activeList.forEach(p => {
        if (p.foto) {
          const img = new Image();
          img.src = getApiUrl(p.foto);
          if (img.decode) {
            img.decode().catch(() => {});
          }
        }
      });
    }
  }, [activeList]);

  const ketua = activeList.find(p => p.level === 1 || /ketua/i.test(p.jabatan)) || defaultPengurus[0];
  const pengawas = activeList.find(p => /pengawas/i.test(p.jabatan)) || defaultPengurus[1];
  const sekretaris = activeList.find(p => /sekretaris/i.test(p.jabatan)) || defaultPengurus[2];
  const bendahara = activeList.find(p => /bendahara/i.test(p.jabatan)) || defaultPengurus[3];

  const listDivisiUsaha = activeList.filter(p => /usaha/i.test(p.jabatan));
  const finalDivisiUsaha = listDivisiUsaha.length > 0 ? listDivisiUsaha : [defaultPengurus[4], defaultPengurus[5]];

  const listDivisiPerlengkapan = activeList.filter(p => /perlengkapan/i.test(p.jabatan));
  const finalDivisiPerlengkapan = listDivisiPerlengkapan.length > 0 ? listDivisiPerlengkapan : [defaultPengurus[6]];

  const manajerSP = activeList.find(p => /simpan/i.test(p.jabatan)) || defaultPengurus[7];
  const manajerToko = activeList.find(p => /toko|pertokoan/i.test(p.jabatan)) || defaultPengurus[8];

  const level1 = activeList.filter(p => p.level === 1);
  const level2 = activeList.filter(p => p.level === 2);
  const level3 = activeList.filter(p => p.level === 3);
  const level4 = activeList.filter(p => p.level === 4);

  const misiItems = (settings.misi || '').split('\n').filter(m => m.trim() !== '');

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>Profil Koperasi UTM</h1>
          <p>Mengenal lebih dekat Koperasi Universitas Trunojoyo Madura</p>
          <div className="breadcrumb">
            <span>Beranda</span>
            <i className="fas fa-chevron-right"></i>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Profil</span>
          </div>
        </div>
      </section>

      {/* TENTANG KOPERASI UTM */}
      <section className="profile-about">
        <div className="container">
          <div className="profile-about-grid">
            {/* Kolom Kiri: Narasi & Ringkasan Kelembagaan */}
            <div className="profile-about-body">
              <h2 className="profile-about-title">{settings.about_title}</h2>
              <div className="profile-about-text" style={{ whiteSpace: 'pre-line' }}>
                {settings.about_desc}
              </div>

              {/* Data Lembaga Singkat */}
              <div className="profile-about-facts">
                <div className="profile-fact-item">
                  <span className="profile-fact-value">1997</span>
                  <span className="profile-fact-label">Tahun Berdiri Resmi</span>
                </div>
                <div className="profile-fact-item">
                  <span className="profile-fact-value">Gedung Cakra</span>
                  <span className="profile-fact-label">Pusat Layanan Kampus</span>
                </div>
                <div className="profile-fact-item">
                  <span className="profile-fact-value">Civitas UTM</span>
                  <span className="profile-fact-label">Dosen, Tendik & Mahasiswa</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Foto Gedung Cakra */}
            <div className="profile-about-media">
              <div className="profile-about-photo">
                <LazyImage
                  src={getApiUrl('img/layanan/cakra.jpeg')}
                  alt="Gedung Cakra Koperasi Universitas Trunojoyo Madura"
                  priority={true}
                  wrapperStyle={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISI MISI */}
      <section className="visimisi">
        <div className="container">
          <div className="section-header">
            <h2>Visi dan Misi Koperasi UTM</h2>
            <p>Pedoman dan arah pengembangan koperasi dalam melayani mahasiswa Universitas Trunojoyo Madura.</p>
          </div>
          <div className="vm-inner">
            <div className="vm-visi-block">
              <div className="vm-visi-marker"><i className="fas fa-bullseye"></i> Visi</div>
              <blockquote>{settings.visi}</blockquote>
            </div>
            <div className="vm-misi-block">
              <div className="vm-visi-marker vm-misi-marker"><i className="fas fa-flag-checkered"></i> Misi</div>
              <div className="vm-misi-list">
                {misiItems.map((m, index) => (
                  <div key={index} className="vm-misi-item">
                    <div className="vm-misi-num">{index + 1}</div>
                    <div className="vm-misi-text">{m}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRUKTUR ORGANISASI Susunan Pengurus */}
      <section className="struktur bagan-section">
        <div className="container">
          <div className="section-header">
            <h2>Susunan Pengurus</h2>
            <p>Bagan struktur kepengurusan resmi Koperasi Universitas Trunojoyo Madura.</p>
          </div>

          {/* View Mode Toggle */}
          <div className="bagan-view-toggle">
            <button
              type="button"
              className={`bagan-toggle-btn ${viewMode === 'bagan' ? 'active' : ''}`}
              onClick={() => setViewMode('bagan')}
            >
              <i className="fas fa-sitemap"></i> Bagan Struktur Resmi
            </button>
            <button
              type="button"
              className={`bagan-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-id-card"></i> Kartu & Foto Pengurus
            </button>
          </div>

          {viewMode === 'bagan' ? (
            <>
              <div className="bagan-mobile-hint">
                <i className="fas fa-arrows-left-right"></i> Geser layar ke samping untuk melihat bagan lengkap
              </div>

              <div className="bagan-container">
                <div className="bagan-bg-layer"></div>
                <div className="bagan-overlay-layer"></div>

                <div className="bagan-scroll-wrapper">
                  <div className="bagan-canvas">
                    {/* LEVEL 0: RAPAT ANGGOTA TAHUNAN */}
                    <div className="bagan-rat-box">
                      RAPAT ANGGOTA TAHUNAN
                    </div>

                    {/* VERTICAL LINE FROM RAT TO KETUA */}
                    <div className="bagan-line-v-center bagan-line-rat-to-ketua"></div>

                    {/* LEVEL 1: KETUA & PENGAWAS */}
                    <div className="bagan-top-tier">
                      <div
                        className="bagan-ketua-container"
                        onClick={() => setSelectedMember(ketua)}
                        title="Klik untuk melihat profil"
                      >
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>{ketua.jabatan || 'KETUA KOPERASI'}</u></div>
                          <div className="bagan-card-name">{ketua.nama}</div>
                        </div>
                      </div>

                      {/* DASHED LINE TO PENGAWAS */}
                      <div className="bagan-pengawas-branch">
                        <div className="bagan-line-dashed-h"></div>
                        <div
                          className="bagan-pengawas-container"
                          onClick={() => setSelectedMember(pengawas)}
                          title="Klik untuk melihat profil"
                        >
                          <div className="bagan-card">
                            <div className="bagan-card-role"><u>{pengawas.jabatan || 'PENGAWAS'}</u></div>
                            <div className="bagan-card-name">{pengawas.nama}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VERTICAL LINE FROM KETUA DOWN TO HORIZONTAL BRANCH */}
                    <div className="bagan-line-v-center bagan-line-ketua-to-branch"></div>

                    {/* BRANCH BAR SYSTEM ACROSS 4 COLUMNS */}
                    <div className="bagan-branch-system">
                      <div className="bagan-branch-h-bar-wrap"></div>
                      <div className="bagan-drops-grid">
                        <div className="bagan-drop-col">
                          <div className="bagan-drop-line"></div>
                          <div className="bagan-drop-arrow"></div>
                        </div>
                        <div className="bagan-drop-col">
                          <div className="bagan-drop-line"></div>
                          <div className="bagan-drop-arrow"></div>
                        </div>
                        <div className="bagan-drop-col">
                          <div className="bagan-drop-line"></div>
                          <div className="bagan-drop-arrow"></div>
                        </div>
                        <div className="bagan-drop-col">
                          <div className="bagan-drop-line"></div>
                          <div className="bagan-drop-arrow"></div>
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 2: 4 COLUMNS (SEKRETARIS, BENDAHARA, DIVISI USAHA, DIVISI PERLENGKAPAN) */}
                    <div className="bagan-middle-grid">
                      {/* Col 1: SEKRETARIS */}
                      <div
                        className="bagan-col-item"
                        onClick={() => setSelectedMember(sekretaris)}
                        title="Klik untuk melihat profil"
                      >
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>{sekretaris.jabatan || 'SEKRETARIS'}</u></div>
                          <div className="bagan-card-name">{sekretaris.nama}</div>
                        </div>
                      </div>

                      {/* Col 2: BENDAHARA */}
                      <div
                        className="bagan-col-item"
                        onClick={() => setSelectedMember(bendahara)}
                        title="Klik untuk melihat profil"
                      >
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>{bendahara.jabatan || 'BENDAHARA'}</u></div>
                          <div className="bagan-card-name">{bendahara.nama}</div>
                        </div>
                      </div>

                      {/* Col 3: DIVISI USAHA */}
                      <div className="bagan-col-item">
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>DIVISI USAHA</u></div>
                          <div className="bagan-card-list">
                            {finalDivisiUsaha.map((p, idx) => (
                              <div
                                key={p.id || idx}
                                className="bagan-card-list-item"
                                onClick={() => setSelectedMember(p)}
                                title="Klik untuk melihat profil"
                              >
                                {idx + 1}. {p.nama}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Col 4: DIVISI PERLENGKAPAN */}
                      <div className="bagan-col-item">
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>DIVISI PERLENGKAPAN</u></div>
                          <div className="bagan-card-list">
                            {finalDivisiPerlengkapan.map((p, idx) => (
                              <div
                                key={p.id || idx}
                                className="bagan-card-list-item"
                                onClick={() => setSelectedMember(p)}
                                title="Klik untuk melihat profil"
                              >
                                {idx + 1}. {p.nama}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VERTICAL LINE DOWN FROM CENTER AXIS TO OPERATIONAL MANAGERS */}
                    <div className="bagan-line-v-center bagan-line-middle-to-manajer"></div>

                    {/* LEVEL 3: OPERATIONAL MANAGERS CONNECTED BY DASHED LINE */}
                    <div className="bagan-manajer-tier">
                      <div
                        className="bagan-manajer-card-wrap"
                        onClick={() => setSelectedMember(manajerSP)}
                        title="Klik untuk melihat profil"
                      >
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>{manajerSP.jabatan || 'MANAJER SIMPAN PINJAM DAN JASA'}</u></div>
                          <div className="bagan-card-name">{manajerSP.nama}</div>
                        </div>
                      </div>

                      {/* HORIZONTAL DASHED LINE BETWEEN MANAGERS */}
                      <div className="bagan-line-manajer-dashed-h"></div>

                      <div
                        className="bagan-manajer-card-wrap"
                        onClick={() => setSelectedMember(manajerToko)}
                        title="Klik untuk melihat profil"
                      >
                        <div className="bagan-card">
                          <div className="bagan-card-role"><u>{manajerToko.jabatan || 'MANAJER PERTOKOAN'}</u></div>
                          <div className="bagan-card-name">{manajerToko.nama}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* GRID PHOTO VIEW */
            <div className="struktur-grid-view">
              {/* Level 1 & Pengawas: Ketua di tengah, Pengawas di sisi kanan */}
              <div className="grid-level-block">
                <h3 className="grid-level-title">
                  Pimpinan & Pengawas Koperasi
                </h3>

                <div className="photo-top-tier">
                  {/* Spacer penyeimbang di sisi kiri agar Ketua tepat berada di tengah layar */}
                  <div className="photo-top-spacer" aria-hidden="true"></div>

                  {/* Posisi Tengah: Ketua Koperasi */}
                  <div className="photo-ketua-container">
                    <div
                      className="struktur-card ketua"
                      onClick={() => setSelectedMember(ketua)}
                      title="Klik untuk melihat profil"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="struktur-avatar">
                        <LazyImage
                          src={ketua.foto ? getApiUrl(ketua.foto) : AVATAR_IMG}
                          alt={ketua.nama}
                          fallbackSrc={AVATAR_IMG}
                          priority={true}
                          wrapperStyle={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      <h4>{ketua.jabatan || 'KETUA KOPERASI'}</h4>
                      <p className="struktur-nama">{ketua.nama}</p>
                    </div>
                  </div>

                  {/* Posisi Kanan: Pengawas (dihubungkan garis koordinasi putus-putus) */}
                  <div className="photo-pengawas-container">
                    <div className="photo-dashed-connector">
                      <span className="photo-connector-line"></span>
                    </div>
                    <div
                      className="struktur-card pengawas"
                      onClick={() => setSelectedMember(pengawas)}
                      title="Klik untuk melihat profil"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="struktur-avatar">
                        <LazyImage
                          src={pengawas.foto ? getApiUrl(pengawas.foto) : AVATAR_IMG}
                          alt={pengawas.nama}
                          fallbackSrc={AVATAR_IMG}
                          priority={true}
                          wrapperStyle={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      <h4>{pengawas.jabatan || 'PENGAWAS'}</h4>
                      <p className="struktur-nama">{pengawas.nama}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 2: Badan Pengurus Harian (Sekretaris, Bendahara) - Pengawas tidak diduplikasi di sini */}
              {(() => {
                const bphItems = level2.filter(p => !/pengawas/i.test(p.jabatan) && p.id !== pengawas?.id && p.id !== ketua?.id);
                const finalBPH = bphItems.length > 0 ? bphItems : [sekretaris, bendahara];
                return finalBPH.length > 0 ? (
                  <div className="grid-level-block">
                    <h3 className="grid-level-title">Badan Pengurus Harian</h3>
                    <div className="grid-cards-row">
                      {finalBPH.map(p => (
                        <div
                          key={p.id}
                          className="struktur-card"
                          onClick={() => setSelectedMember(p)}
                          title="Klik untuk melihat profil"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="struktur-avatar">
                            <LazyImage src={p.foto ? getApiUrl(p.foto) : AVATAR_IMG} alt={p.nama} fallbackSrc={AVATAR_IMG} loading="eager" wrapperStyle={{ width: '100%', height: '100%' }} />
                          </div>
                          <h4>{p.jabatan}</h4>
                          <p className="struktur-nama">{p.nama}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Level 3: Divisi Operasional (Divisi Usaha, Divisi Perlengkapan) */}
              {level3.length > 0 && (
                <div className="grid-level-block">
                  <h3 className="grid-level-title">Divisi Operasional</h3>
                  <div className="grid-cards-row">
                    {level3.map(p => (
                      <div
                        key={p.id}
                        className="struktur-card"
                        onClick={() => setSelectedMember(p)}
                        title="Klik untuk melihat profil"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="struktur-avatar">
                          <LazyImage src={p.foto ? getApiUrl(p.foto) : AVATAR_IMG} alt={p.nama} fallbackSrc={AVATAR_IMG} loading="eager" wrapperStyle={{ width: '100%', height: '100%' }} />
                        </div>
                        <h4>{p.jabatan}</h4>
                        <p className="struktur-nama">{p.nama}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 4: Manajer Layanan (Simpan Pinjam, Pertokoan) */}
              {level4.length > 0 && (
                <div className="grid-level-block">
                  <h3 className="grid-level-title">Manajer Layanan</h3>
                  <div className="grid-cards-row">
                    {level4.map(p => (
                      <div
                        key={p.id}
                        className="struktur-card"
                        onClick={() => setSelectedMember(p)}
                        title="Klik untuk melihat profil"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="struktur-avatar">
                          <LazyImage src={p.foto ? getApiUrl(p.foto) : AVATAR_IMG} alt={p.nama} fallbackSrc={AVATAR_IMG} loading="eager" wrapperStyle={{ width: '100%', height: '100%' }} />
                        </div>
                        <h4>{p.jabatan}</h4>
                        <p className="struktur-nama">{p.nama}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODAL POPUP FOR MEMBER DETAIL */}
          {selectedMember && (
            <div className="bagan-modal-backdrop" onClick={() => setSelectedMember(null)}>
              <div className="bagan-modal-content" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className="bagan-modal-close"
                  onClick={() => setSelectedMember(null)}
                  aria-label="Tutup"
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="bagan-modal-avatar">
                  <LazyImage
                    src={selectedMember.foto ? getApiUrl(selectedMember.foto) : AVATAR_IMG}
                    alt={selectedMember.nama}
                    fallbackSrc={AVATAR_IMG}
                    priority={true}
                    wrapperStyle={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className="bagan-modal-badge">{selectedMember.jabatan}</div>
                <h3 className="bagan-modal-name">{selectedMember.nama}</h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GALERI */}
      {(() => {
        let galeriItems = [];
        try { galeriItems = JSON.parse(settings.galeri_items || '[]'); } catch {}
        if (!Array.isArray(galeriItems)) galeriItems = [];
        return galeriItems.length > 0 ? (
          <section className="gallery">
            <div className="container">
              <div className="section-header">
                <h2>{settings.galeri_judul}</h2>
                <p>{settings.galeri_deskripsi}</p>
              </div>
              <div className="gallery-grid">
                {galeriItems.map((item, i) => (
                  <div className="gallery-item" key={i}>
                    <LazyImage src={getApiUrl(item.gambar)} alt={item.judul} wrapperStyle={{ width: '100%', height: '100%' }} />
                    <div className="gallery-overlay"><span>{item.judul}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;
      })()}
    </>
  );
};

export default Profile;
