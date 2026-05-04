import streamlit as st
import pickle
import pandas as pd

st.set_page_config(
    page_title='SpamAI',
    page_icon='icon.png',
    layout='wide',
    initial_sidebar_state='collapsed'  # Hide sidebar!
)

# Custom CSS - Modern Design
st.markdown("""
    <style>
    /* Hide sidebar */
    [data-testid="stSidebar"] {
        display: none;
    }
    
    /* White background */
    .stApp {
        background: white;
    }
    
    /* Top Navigation Bar */
    .top-nav {
        background: linear-gradient(135deg, #e0c3fc 0%, #c9b3f5 100%);
        padding: 40px;
        border: 3px solid black;
        border-radius: 0px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }
    
    .nav-title {
        font-size: 50px;
        font-weight: bold;
        color: black;
        background: white;
    }
    
    .nav-buttons {
        display: flex;
        gap: 10px;
    }
    
    .nav-btn {
        background: white;
        color: black;
        border: 2px solid black;
        padding: 30px 25px;
        font-size: 16px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .user-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #c9b3f5;
        border: 2px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
    }
    
    /* Purple boxes */
    .purple-box {
        background: linear-gradient(135deg, #e0c3fc 0%, #c9b3f5 100%);
        border: 3px solid black;
        border-radius: 15px;
        padding: 40px;
        margin: 20px auto;
        max-width: 800px;
    }
    
    .white-inner-box {
        background: black;
        border: 3px solid black;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
    }
    
    /* Big centered title */
    .big-title {
        font-size: 50px;
        font-weight: bold;
        text-align: center;
        margin: 60px 0 40px 0;
        color: black;
    }
    
    /* Subtitle styling */
    .subtitle {
        font-size: 20px;
        line-height: 1.8;
    }
    
    /* Report box styling */
    .report-box {
        background: black;
        border: 3px solid black;
        border-radius: 15px;
        padding: 40px;
        margin: 10px auto;
        max-width: 900px;
    }
    
    .metric-box {
        background: black;
        border: 2px solid white;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
    }
    
    /* Hide streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    </style>
""", unsafe_allow_html=True)

# Load model
@st.cache_resource
def load_model():
    model = pickle.load(open('spam_model.pkl', 'rb'))
    vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))
    return model, vectorizer

model, vectorizer = load_model()

# Initialize session state
if 'page' not in st.session_state:
    st.session_state.page = 'home'

# TOP NAVIGATION BAR
col1, col2, col3 = st.columns([2, 3, 1])

with col1:
    st.markdown('<div class="nav-title">SPAM AI  </div>', unsafe_allow_html=True)

with col2:
    sub_col1, sub_col2, sub_col3, sub_col4 = st.columns(4)
    with sub_col1:
        if st.button("Home", use_container_width=True):
            st.session_state.page = 'home'
    with sub_col2:
        if st.button("Detect", use_container_width=True):
            st.session_state.page = 'detect'
    with sub_col3:
        if st.button("About", use_container_width=True):
            st.session_state.page = 'about'

with col3:
    st.markdown('<div class="user-icon">I</div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ============ HOME PAGE ============
if st.session_state.page == 'home':
    st.markdown('<div class="big-title">SPAM EMAIL DETECTOR</div>', unsafe_allow_html=True)
    
    st.markdown("""
        <div class="purple-box">
            <div class="white-inner-box">
                <h2>What it provides:</h2>
                <div class="subtitle">
                    ✓ AI-powered spam detection<br>
                    ✓ 98% accuracy rate<br>
                    ✓ Instant results with confidence scores<br>
                    ✓ Trained on 5,000+ real messages
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("PROCEED", use_container_width=True, type="primary"):
            st.session_state.page = 'detect'
            st.rerun()

# ============ DETECT PAGE ============
elif st.session_state.page == 'detect':
    st.markdown('<div class="big-title">DETECT SPAM</div>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
            <div class="purple-box">
                <h3 style="text-align: center; margin-bottom: 1px;">INSERT MAIL / COPY MAIL TEXT</h3>
        """, unsafe_allow_html=True)
        
        user_input = st.text_area(
            "",
            placeholder="email@example.com or paste email content...",
            height=120,
            label_visibility="collapsed"
        )
        
        if st.button("🔍 DETECT", use_container_width=True, type="primary"):
            if user_input.strip():
                # Transform and predict
                input_tfidf = vectorizer.transform([user_input])
                prediction = model.predict(input_tfidf)[0]
                probability = model.predict_proba(input_tfidf)[0]
                
                # Store in session
                st.session_state.prediction = prediction
                st.session_state.spam_prob = probability[1] * 100
                st.session_state.ham_prob = probability[0] * 100
                
        st.markdown("</div>", unsafe_allow_html=True)
        
        # Show results if prediction exists
        if 'prediction' in st.session_state:
            st.markdown("<br>", unsafe_allow_html=True)
            
            st.markdown("""
                <div class="report-box">
                    <h2 style="text-align: center; border-bottom: 3px solid black; padding-bottom: 15px;">📊 REPORT</h2>
                    <br>
            """, unsafe_allow_html=True)
            
            col_a, col_b = st.columns([1, 2])
            
            with col_a:
                prediction = st.session_state.prediction
                confidence = st.session_state.spam_prob if prediction == 1 else st.session_state.ham_prob
                
                st.markdown(f"""
                    <div style='text-align: center; padding: 20px;'>
                        <div style='
                            width: 180px; 
                            height: 180px; 
                            border: 12px solid #8b5cf6; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            margin: auto;
                            background: #f5f0ff;
                        '>
                            <div style='font-size: 48px; font-weight: bold; color: #8b5cf6;'>
                                {confidence:.0f}<span style='font-size: 24px;'>%</span>
                            </div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
            
            with col_b:
                if st.session_state.prediction == 1:
                    st.markdown("""
                        <div class="metric-box" style="background: #ffebee; border-color: #c62828;">
                            <h3 style="color: #c62828;">SPAM DETECTED</h3>
                        </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown("""
                        <div class="metric-box" style="background: #e8f5e9; border-color: #2e7d32;">
                            <h3 style="color: #2e7d32;">LEGITIMATE EMAIL (HAM)</h3>
                        </div>
                    """, unsafe_allow_html=True)
                
                st.markdown(f"""
                    <div class="metric-box">
                        <strong>Metric 1: Spam Probability</strong>
                        <div style="text-align: right; color: #8b5cf6; font-size: 24px; font-weight: bold;">
                            {st.session_state.spam_prob:.2f}%
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                st.markdown(f"""
                    <div class="metric-box">
                        <strong>Metric 2: Ham Probability</strong>
                        <div style="text-align: right; color: #8b5cf6; font-size: 24px; font-weight: bold;">
                            {st.session_state.ham_prob:.2f}%
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                st.markdown(f"""
                    <div class="metric-box">
                        <strong>Metric 3: Confidence Level</strong>
                        <div style="text-align: right; color: #8b5cf6; font-size: 24px; font-weight: bold;">
                            {confidence:.2f}%
                        </div>
                    </div>
                """, unsafe_allow_html=True)
            
            st.markdown("</div>", unsafe_allow_html=True)

# ============ ABOUT PAGE ============
elif st.session_state.page == 'about':
    st.markdown('<div class="big-title">ABOUT</div>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
            <div class="purple-box">
                <div class="white-inner-box" style="text-align: left;">
                    <h2>About This Project</h2>
                    <br>
                    <p>This spam email detector uses <strong>Machine Learning</strong> to identify spam messages with 98% accuracy.</p>
                    <br>
                    <h3>Technology Stack:</h3>
                    <ul>
                        <li><strong>Algorithm:</strong> Naive Bayes Classifier</li>
                        <li><strong>Feature Extraction:</strong> TF-IDF Vectorization</li>
                        <li><strong>Training Data:</strong> 5,572 labeled messages</li>
                        <li><strong>Framework:</strong> scikit-learn, Streamlit</li>
                    </ul>
                    <br>
                    <h3>Model Performance:</h3>
                    <ul>
                        <li>✅ Accuracy: 98%</li>
                        <li>✅ Precision: 99%</li>
                        <li>✅ Recall: 89%</li>
                        <li>✅ F1-Score: 94%</li>
                    </ul>
                    <br>
                    <p><strong>Created by:</strong> Sudeepa<br>
                    <strong>Date:</strong> Feb 2026<br>
                    <strong>First AI/ML Project</strong> 🎉</p>
                    <hr>
                    <h3>How It Works:</h3>
                    <ol>
                        <li>Text is converted to numerical features using TF-IDF</li>
                        <li>Naive Bayes algorithm analyzes word patterns</li>
                        <li>Model predicts spam probability</li>
                        <li>Results displayed with confidence score</li>
                    </ol>
                    <br>
                    <p style="background: #e3f2fd; padding: 15px; border-radius: 8px; border: 2px solid #1976d2;">
                        💡 <strong>Tip:</strong> This model works best with English text messages and emails!
                    </p>
                </div>
            </div>
        """, unsafe_allow_html=True)