import streamlit as st
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import joblib

st.set_page_config(page_title="Rekomendasi Jurusan UTBK", layout="centered")

# --- Memuat Model dan Scaler ---


@st.cache_resource
def load_keras_model():
    try:
        model = tf.keras.models.load_model("model/my_model.h5")
        return model
    except Exception as e:
        st.error(
            f"Error: Model 'my_model.h5' tidak ditemukan atau tidak dapat dimuat. Pastikan file model berada di direktori yang benar. Detail: {e}")
        st.stop()


model = load_keras_model()


@st.cache_resource
def load_scaler():
    try:
        scaler = joblib.load('scaler.pkl')
        st.sidebar.success("Scaler berhasil dimuat dari 'scaler.pkl'.")
        return scaler
    except FileNotFoundError:
        st.error(
            "Error: File 'scaler.pkl' tidak ditemukan. Pastikan sudah dibuat dan diletakkan di direktori yang sama.")
        st.stop()
    except Exception as e:
        st.error(f"Error saat memuat scaler. Detail: {e}")
        st.stop()


scaler = load_scaler()

# --- Memuat Data Major dan Univ ---


@st.cache_data
def load_major_univ_data():
    try:
        major_df = pd.read_csv('data/majors.csv', index_col=0)
        univ_df = pd.read_csv('data/universities.csv', index_col=0)

        major_df['type'] = major_df['type'].str.lower().str.strip()
        major_df['type'] = major_df['type'].replace(
            {'saintek': 'science', 'soshum': 'humanities'})

        major_df['utbk_capacity'] = (0.4 * major_df['capacity']).apply(int)
        major_df['passed_count'] = 0
        major_univ_df = pd.merge(
            major_df, univ_df, on='id_university', how='left')
        major_univ_df.set_index('id_major', inplace=True)
        return major_univ_df
    except FileNotFoundError:
        st.error(
            "File 'majors.csv' atau 'universities.csv' tidak ditemukan. Pastikan file data ada di direktori yang sama.")
        st.stop()
    except Exception as e:
        st.error(
            f"Error saat memuat atau memproses data jurusan/universitas. Detail: {e}")
        st.stop()


major_univ = load_major_univ_data()

# --- Debugging informasi data ---
st.sidebar.subheader("DEBUG: Info Kolom 'type'")
if 'type' in major_univ.columns:
    st.sidebar.write("Unique values di kolom 'type' setelah pemrosesan:")
    st.sidebar.write(major_univ['type'].unique())
    st.sidebar.write(
        f"Jumlah baris dengan 'science': {len(major_univ[major_univ['type'] == 'science'])}")
    st.sidebar.write(
        f"Jumlah baris dengan 'humanities': {len(major_univ[major_univ['type'] == 'humanities'])}")
else:
    st.sidebar.warning(
        "Kolom 'type' tidak ditemukan di major_univ. Pastikan kolom 'type' ada di majors.csv.")


# --- Antarmuka Streamlit untuk Rekomendasi ---
st.title("Sistem Rekomendasi Jurusan UTBK")
st.write("Aplikasi ini akan merekomendasikan jurusan berdasarkan nilai UTBK dan preferensi Anda.")
st.markdown("---")

st.header("Masukkan Data Calon Mahasiswa untuk Rekomendasi")

# --- Input Nilai Ujian UTBK (Per Mata Pelajaran) ---
st.subheader("Nilai Ujian UTBK (Per Mata Pelajaran)")

test_type_mapping_rec = {'Science': 'science', 'Humanities': 'humanities'}
test_type_selection_rec = st.selectbox(
    "Tipe Tes (Pilihan Anda)",
    options=list(test_type_mapping_rec.keys()),
    index=0  # Default ke Science
)
test_type_string = test_type_mapping_rec[test_type_selection_rec]
test_type_encoded = 0 if test_type_string == 'science' else 1

# Mengumpulkan semua skor dalam satu dictionary untuk memudahkan perhitungan
scores = {}
min_val, max_val = 0.0, 1000.0

if test_type_string == 'science':  # Science (Saintek)
    st.markdown("##### Nilai Tes Potensi Skolastik (TPS)")
    col_tps_sci1, col_tps_sci2 = st.columns(2)
    with col_tps_sci1:
        scores['score_kpu'] = st.number_input(
            "Skor KPU", min_value=min_val, max_value=max_val, value=750.0, step=0.01, key='kpu_sci')
        scores['score_kua'] = st.number_input(
            "Skor KUA", min_value=min_val, max_value=max_val, value=780.0, step=0.01, key='kua_sci')
    with col_tps_sci2:
        scores['score_ppu'] = st.number_input(
            "Skor PPU", min_value=min_val, max_value=max_val, value=760.0, step=0.01, key='ppu_sci')
        scores['score_kmb'] = st.number_input(
            "Skor KMB", min_value=min_val, max_value=max_val, value=770.0, step=0.01, key='kmb_sci')

    st.markdown("##### Nilai Tes Kemampuan Akademik (TKA) Saintek")
    col_tka_sci1, col_tka_sci2 = st.columns(2)
    with col_tka_sci1:
        scores['score_mat_tka'] = st.number_input(
            "Skor Matematika", min_value=min_val, max_value=max_val, value=850.0, step=0.01, key='mat_sci')
        scores['score_fis'] = st.number_input(
            "Skor Fisika", min_value=min_val, max_value=max_val, value=820.0, step=0.01, key='fis_sci')
    with col_tka_sci2:
        scores['score_kim'] = st.number_input(
            "Skor Kimia", min_value=min_val, max_value=max_val, value=830.0, step=0.01, key='kim_sci')
        scores['score_bio'] = st.number_input(
            "Skor Biologi", min_value=min_val, max_value=max_val, value=840.0, step=0.01, key='bio_sci')

    general_score_rec = np.mean(
        [scores['score_kpu'], scores['score_kua'], scores['score_ppu'], scores['score_kmb']])
    specialize_score_rec = np.mean(
        [scores['score_mat_tka'], scores['score_fis'], scores['score_kim'], scores['score_bio']])
    score_mean_rec = np.mean(list(scores.values()))

elif test_type_string == 'humanities':  # Humanities (Soshum)
    st.markdown("##### Nilai Tes Potensi Skolastik (TPS)")
    col_tps_hum1, col_tps_hum2 = st.columns(2)
    with col_tps_hum1:
        scores['score_kpu'] = st.number_input(
            "Skor KPU", min_value=min_val, max_value=max_val, value=750.0, step=0.01, key='kpu_hum')
        scores['score_kua'] = st.number_input(
            "Skor KUA", min_value=min_val, max_value=max_val, value=780.0, step=0.01, key='kua_hum')
    with col_tps_hum2:
        scores['score_ppu'] = st.number_input(
            "Skor PPU", min_value=min_val, max_value=max_val, value=760.0, step=0.01, key='ppu_hum')
        scores['score_kmb'] = st.number_input(
            "Skor KMB", min_value=min_val, max_value=max_val, value=770.0, step=0.01, key='kmb_hum')

    st.markdown("##### Nilai Tes Kemampuan Akademik (TKA) Soshum")
    col_tka_hum1, col_tka_hum2 = st.columns(2)
    with col_tka_hum1:
        scores['score_mat_tka'] = st.number_input(
            "Skor Matematika", min_value=min_val, max_value=max_val, value=800.0, step=0.01, key='mat_hum')
        scores['score_geo'] = st.number_input(
            "Skor Geografi", min_value=min_val, max_value=max_val, value=810.0, step=0.01, key='geo_hum')
    with col_tka_hum2:
        scores['score_sej'] = st.number_input(
            "Skor Sejarah", min_value=min_val, max_value=max_val, value=820.0, step=0.01, key='sej_hum')
        scores['score_sos'] = st.number_input(
            "Skor Sosiologi", min_value=min_val, max_value=max_val, value=830.0, step=0.01, key='sos_hum')
        scores['score_eko'] = st.number_input(
            "Skor Ekonomi", min_value=min_val, max_value=max_val, value=840.0, step=0.01, key='eko_hum')

    general_score_rec = np.mean(
        [scores['score_kpu'], scores['score_kua'], scores['score_ppu'], scores['score_kmb']])
    specialize_score_rec = np.mean([scores['score_mat_tka'], scores['score_geo'],
                                   scores['score_sej'], scores['score_sos'], scores['score_eko']])
    score_mean_rec = np.mean(list(scores.values()))

st.markdown(f"**Nilai Rata-rata Umum Anda (TPS):** `{general_score_rec:.2f}`")
st.markdown(
    f"**Nilai Rata-rata Spesialisasi Anda (TKA):** `{specialize_score_rec:.2f}`")
st.markdown(f"**Nilai Rata-rata Keseluruhan:** `{score_mean_rec:.2f}`")

st.markdown("---")

if st.button("Dapatkan Rekomendasi Jurusan"):
    st.subheader("Menghitung Rekomendasi...")

    with st.spinner("Memproses rekomendasi, mohon tunggu..."):
        recommendations = []
        # Filter jurusan berdasarkan test_type_string yang dipilih oleh user
        filtered_majors = major_univ[major_univ['type']
                                     == test_type_string].copy()

        if filtered_majors.empty:
            st.warning(
                f"Tidak ada jurusan '{test_type_selection_rec}' yang ditemukan di dataset. Mohon periksa data Anda atau jenis tes yang dipilih.")
        else:
            for index, row in filtered_majors.iterrows():
                id_major_candidate = index
                id_university_candidate = row['id_university']

                simulated_input = np.array([
                    id_major_candidate,
                    id_university_candidate,
                    id_major_candidate,
                    id_university_candidate,
                    general_score_rec,
                    specialize_score_rec,
                    score_mean_rec,
                    test_type_encoded
                ]).reshape(1, -1)

                scaled_input = scaler.transform(simulated_input)
                prob_pass = model.predict(scaled_input)[0][0]

                recommendations.append({
                    "id_major": id_major_candidate,
                    "major_name": row['major_name'],
                    "university_name": row['university_name'],
                    "prob_pass": prob_pass,
                    "capacity": row['capacity'],
                    "utbk_capacity": row['utbk_capacity']
                })

            recom_df = pd.DataFrame(recommendations)
            threshold_rekomendasi = 0.5

            final_recommendations = recom_df[recom_df['prob_pass'] >= threshold_rekomendasi].sort_values(
                by='prob_pass', ascending=False)

            if not final_recommendations.empty:
                st.success(
                    "Berikut adalah jurusan yang mungkin cocok untuk Anda:")
                st.dataframe(
                    final_recommendations[[
                        'major_name', 'university_name', 'prob_pass', 'utbk_capacity']].head(15).round(3),
                    use_container_width=True
                )
                st.markdown(
                    f"**Catatan:** Probabilitas kelulusan adalah estimasi berdasarkan model. Jurusan diurutkan dari probabilitas tertinggi.")
            else:
                st.warning(
                    f"Maaf, tidak ada jurusan yang direkomendasikan dengan probabilitas kelulusan di atas {threshold_rekomendasi:.0%}."
                    " Ini bisa terjadi jika nilai Anda terlalu rendah untuk semua jurusan di jenis tes yang Anda pilih, "
                    "atau kapasitas jurusan sangat terbatas."
                )
                st.info(
                    "Anda bisa mencoba menyesuaikan nilai atau mencari jurusan lain.")

st.markdown("---")
st.caption("Aplikasi ini dibuat untuk tujuan demonstrasi model machine learning.")
