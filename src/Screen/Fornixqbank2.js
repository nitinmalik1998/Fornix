// Fornixqbank2.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Tts from 'react-native-tts';

// Screen dimensions
const {width, height} = Dimensions.get('window');

// 🔹 Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 🔹 Responsive size function based on screen width
const getResponsiveSize = (size) => {
  if (width < 375) { // Small phones
    return size * 0.85;
  } else if (width > 414) { // Large phones
    return size * 1.15;
  }
  return size; // Normal phones
};

// 🔹 Get responsive transform values for header
const getHeaderTransform = () => {
  if (width < 375) return 1.6; // Small phones
  if (width > 414) return 1.8; // Large phones
  return 1.7; // Normal phones
};

// 🔹 Get responsive search container transform
const getSearchTransform = () => {
  if (width < 375) return 0.62; // Small phones
  if (width > 414) return 0.55; // Large phones
  return 0.58; // Normal phones
};

const Fornixqbank2 = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 🔹 Question state
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPrevPressed, setIsPrevPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [isAudioPressed, setIsAudioPressed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🔹 Store TTS event listeners for proper cleanup
  const [ttsListeners, setTtsListeners] = useState([]);

  // 🔹 Question data from PDF
  const questionData = {
    question: 'Q8. Which chamber of the heart receives oxygenated blood from the lungs?',
    options: [
      {id: 'A', text: 'Right atrium'},
      {id: 'B', text: 'Left atrium'},
      {id: 'C', text: 'Right ventricle'},
      {id: 'D', text: 'Left ventricle'},
    ],
    correctAnswer: 'B',
    example: 'When you breathe in, oxygen enters your lungs and passes into the bloodstream through tiny blood vessels called capillaries. The oxygenated blood then travels to the left atrium of the heart through the pulmonary veins.',
  };

  // Initialize TTS with proper event listener management
  useEffect(() => {
    let isMounted = true;
    const listeners = [];

    const initializeTTS = async () => {
      try {
        // Configure TTS
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);

        if (isMounted) {
          // Add event listeners and store them for cleanup
          const startListener = Tts.addEventListener('tts-start', () => {
            if (isMounted) setIsSpeaking(true);
          });
          
          const finishListener = Tts.addEventListener('tts-finish', () => {
            if (isMounted) setIsSpeaking(false);
          });
          
          const cancelListener = Tts.addEventListener('tts-cancel', () => {
            if (isMounted) setIsSpeaking(false);
          });

          listeners.push(startListener, finishListener, cancelListener);
          setTtsListeners(listeners);
        }
      } catch (error) {
        console.log('TTS Initialization Error:', error);
      }
    };

    initializeTTS();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      // Properly remove all TTS event listeners
      listeners.forEach(listener => {
        if (listener && listener.remove) {
          listener.remove();
        }
      });
      
      // Also try the global removeAllListeners as fallback
      try {
        Tts.stop();
        if (Tts.removeAllListeners) {
          Tts.removeAllListeners('tts-start');
          Tts.removeAllListeners('tts-finish');
          Tts.removeAllListeners('tts-cancel');
        }
      } catch (error) {
        console.log('TTS Cleanup Error:', error);
      }
    };
  }, []);

  // 🔹 Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );

    return () => {
      if (backHandler && backHandler.remove) {
        backHandler.remove();
      }
    };
  }, []);

  const handleHardwareBackPress = () => {
    // Stop any ongoing speech when navigating away
    stopTTS();
    // Use replace to prevent going back to previous quiz screen
    navigation.replace('Topicwise');
    return true; // Prevent default behavior (app closing)
  };

  // 🔹 Proper TTS stop function
  const stopTTS = async () => {
    try {
      await Tts.stop();
      if (isSpeaking) {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.log('TTS Stop Error:', error);
    }
  };

  const handleOptionSelect = optionId => {
    setSelectedOption(optionId);
    setShowExplanation(true);
  };

  // 🔹 Fixed back navigation - use replace instead of navigate
  const handlePrevious = () => {
    // Stop any ongoing speech when navigating away
    stopTTS();
    navigation.replace('Topicwise');
  };

  // 🔹 Fixed back button handler for the header back button - use replace
  const handleBackButton = () => {
    // Stop any ongoing speech when navigating away
    stopTTS();
    navigation.replace('Topicwise');
  };

  const handleNext = () => {
    // Stop any ongoing speech when navigating away
    stopTTS();
    // Navigate to next question using replace
    setSelectedOption(null);
    setShowExplanation(false);
    // Here you would typically navigate to the next question using replace
    // navigation.replace('NextQuestionScreen');
  };

  const handleAudioExplanation = async () => {
    try {
      if (isSpeaking) {
        // Stop speaking if already speaking
        await stopTTS();
      } else {
        // Start speaking the explanation
        const textToSpeak = `${questionData.example} The correct answer is ${questionData.correctAnswer}.`;
        await Tts.speak(textToSpeak);
      }
    } catch (error) {
      console.log('TTS Error:', error);
      Alert.alert('Audio Error', 'Could not play audio explanation. Please try again.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleBackButton} // Fixed: Uses replace now
                style={styles.backButton}>
                <Icon1
                  name="arrow-back"
                  size={moderateScale(getResponsiveSize(28))}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.title}>Anatomy</Text>
            </View>
            <Text style={styles.sectionTitle1}>Fornix Q Bank</Text>
          </View>
        </View>

        {/* 🔹 Question Container */}
        <View style={styles.questionContainer}>
          {/* 🔹 Question Text */}
          <Text style={styles.questionText}>{questionData.question}</Text>

          {/* 🔹 Options */}
          <View style={styles.optionsContainer}>
            {questionData.options.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedOption === option.id && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option.id)}>
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionCircle,
                      selectedOption === option.id &&
                        styles.optionCircleSelected,
                    ]}>
                    <Text
                      style={[
                        styles.optionId,
                        selectedOption === option.id && styles.optionIdSelected,
                      ]}>
                      {option.id}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option.id && styles.optionTextSelected,
                    ]}>
                    {option.text}
                  </Text>
                </View>
                {selectedOption === option.id && (
                  <Icon name="check" size={moderateScale(getResponsiveSize(16))} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔹 Example Section */}
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Example</Text>
                <View style={styles.sectionLine} />
              </View>
              
              <Text style={styles.exampleText}>{questionData.example}</Text>

              {/* 🔹 Correct Answer Indicator */}
              <View style={styles.correctAnswerContainer}>
                <View style={styles.correctAnswerHeader}>
                  <Icon name="check-circle" size={moderateScale(getResponsiveSize(18))} color="#4CAF50" />
                  <Text style={styles.correctAnswerText}>Correct Answer</Text>
                </View>
                <Text style={styles.correctAnswerValue}>{questionData.correctAnswer}</Text>
              </View>

              {/* 🔹 Audio Explanation Button */}
              <TouchableOpacity
                style={[
                  styles.audioButton,
                  isAudioPressed && styles.audioButtonPressed,
                  isSpeaking && styles.audioButtonSpeaking,
                ]}
                onPress={handleAudioExplanation}
                onPressIn={() => setIsAudioPressed(true)}
                onPressOut={() => setIsAudioPressed(false)}>
                <View style={styles.audioContent}>
                  <Icon2 
                    name={isSpeaking ? "pausecircle" : "sound"} 
                    size={moderateScale(getResponsiveSize(20))} 
                    color="#FFFFFF" 
                    style={styles.audioIcon}
                  />
                  <Text style={styles.audioText}>
                    {isSpeaking ? 'Stop Audio' : 'Audio Explanation'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* 🔹 Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                isPrevPressed && styles.navButtonPressed,
              ]}
              onPress={handlePrevious} // Fixed: Uses replace now
              onPressIn={() => setIsPrevPressed(true)}
              onPressOut={() => setIsPrevPressed(false)}>
              <Text
                style={[
                  styles.navButtonText,
                  isPrevPressed && styles.navButtonTextPressed,
                ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                isNextPressed && styles.navButtonPressed,
              ]}
              onPress={handleNext}
              onPressIn={() => setIsNextPressed(true)}
              onPressOut={() => setIsNextPressed(false)}>
              <Text
                style={[
                  styles.navButtonText,
                  isNextPressed && styles.navButtonTextPressed,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(getResponsiveSize(20)),
  },
  header: {
    backgroundColor: '#F87F16',
    marginBottom: verticalScale(getResponsiveSize(40)),
    paddingBottom: verticalScale(getResponsiveSize(10)),
    height: verticalScale(getResponsiveSize(170)),
    borderBottomLeftRadius: scale(getResponsiveSize(400)),
    borderBottomRightRadius: scale(getResponsiveSize(400)),
    transform: [{scaleX: getHeaderTransform()}],
  },
  searchContainer: {
    paddingHorizontal: scale(getResponsiveSize(50)),
    paddingVertical: verticalScale(getResponsiveSize(20)),
    transform: [{scaleX: getSearchTransform()}],
    paddingTop: verticalScale(getResponsiveSize(60)),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: width < 375 ? -25 : -30,
    paddingHorizontal: scale(getResponsiveSize(10)),
    zIndex: 1,
  },
  title: {
    fontSize: moderateScale(getResponsiveSize(25)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSize(25)),
    includeFontPadding: false,
  },
  sectionTitle1: {
    fontSize: moderateScale(getResponsiveSize(15)),
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginTop: verticalScale(getResponsiveSize(-20)),
    includeFontPadding: false,
  },
  questionContainer: {
    marginHorizontal: scale(getResponsiveSize(20)),
    borderRadius: moderateScale(getResponsiveSize(16)),
    padding: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(30)),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    lineHeight: moderateScale(getResponsiveSize(24)),
    marginBottom: verticalScale(getResponsiveSize(25)),
    includeFontPadding: false,
  },
  optionsContainer: {
    marginBottom: verticalScale(getResponsiveSize(30)),
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(10)),
    padding: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(12)),
    borderWidth: 1,
    borderColor: '#1A3848',
    minHeight: verticalScale(getResponsiveSize(60)),
  },
  optionSelected: {
    backgroundColor: '#F87F16',
    borderColor: '#F87F16',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionCircle: {
    width: scale(getResponsiveSize(30)),
    height: scale(getResponsiveSize(30)),
    borderRadius: scale(getResponsiveSize(15)),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(getResponsiveSize(12)),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionId: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  optionIdSelected: {
    color: 'white',
  },
  optionText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    flex: 1,
    includeFontPadding: false,
  },
  optionTextSelected: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  // 🔹 Explanation Section Styles
  explanationContainer: {
    borderRadius: moderateScale(getResponsiveSize(12)),
    padding: scale(getResponsiveSize(20)),
    marginBottom: verticalScale(getResponsiveSize(25)),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(15)),
  },
  sectionTitle: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#1A3848',
    marginRight: scale(getResponsiveSize(10)),
    includeFontPadding: false,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  exampleText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-Regular',
    color: '#1A3848',
    lineHeight: moderateScale(getResponsiveSize(22)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    includeFontPadding: false,
  },
  // 🔹 Correct Answer Styles
  correctAnswerContainer: {
    backgroundColor: '#F0F9F0',
    borderRadius: moderateScale(getResponsiveSize(8)),
    padding: scale(getResponsiveSize(15)),
    marginBottom: verticalScale(getResponsiveSize(20)),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  correctAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSize(5)),
  },
  correctAnswerText: {
    fontSize: moderateScale(getResponsiveSize(14)),
    fontFamily: 'Poppins-SemiBold',
    color: '#2E7D32',
    marginLeft: scale(getResponsiveSize(8)),
    includeFontPadding: false,
  },
  correctAnswerValue: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-Bold',
    color: '#1A3848',
    marginLeft: scale(getResponsiveSize(26)),
    includeFontPadding: false,
  },
  // 🔹 Audio Button Styles
  audioButton: {
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(10)),
    paddingVertical: verticalScale(getResponsiveSize(15)),
    paddingHorizontal: scale(getResponsiveSize(20)),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(getResponsiveSize(50)),
  },
  audioButtonPressed: {
    backgroundColor: '#0F2A38',
  },
  audioButtonSpeaking: {
    backgroundColor: '#F87F16',
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIcon: {
    marginRight: scale(getResponsiveSize(12)),
  },
  audioText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  // 🔹 Navigation Buttons
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: '#1A3848',
    borderRadius: moderateScale(getResponsiveSize(8)),
    paddingVertical: verticalScale(getResponsiveSize(12)),
    paddingHorizontal: scale(getResponsiveSize(25)),
    minWidth: scale(getResponsiveSize(120)),
    alignItems: 'center',
    minHeight: verticalScale(getResponsiveSize(45)),
  },
  navButtonPressed: {
    backgroundColor: '#F87F16',
  },
  navButtonText: {
    fontSize: moderateScale(getResponsiveSize(16)),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  navButtonTextPressed: {
    color: '#FFFFFF',
  },
});

export default Fornixqbank2;