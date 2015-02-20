define(function(require) {

  var SelectComfortConstants = {

    // *********************************
    // Constants
    // *********************************
    SERVICE: 'ffffd1fd-388d-938b-344a-939d1f6efee0',
    CHARACTERISTIC_TX: 'ffffd1fd-388d-938b-344a-939d1f6efee1',
    CHARACTERISTIC_RX: 'ffffd1fd-388d-938b-344a-939d1f6efee2',

    /** Sleep Expert **/
    SleepExpertLongKeys: ['SWSC','SWST','SWCF','SREL','SRFS','SFWU'],

    /** The Reply bit */
    SCReplyBit: 0x80,
    
    /** All Devices Commands */
    SCDeviceQueryRequest: 0x00,
    SCBindClearRequest: 0x01,
    SCForceIdleRequest: 0x02,
    SCControlBindTableRequest: 0x05,
    SCControlBindWindowRequest: 0x06,
    SCNameRequest: 0x20,
    SCChangeChannelRequest: 0x64,
    SCSignalStrengthRequest: 0x65,
    SCSoftwareRevisionRequest: 0x71,
    
    /** MCR Proxy Commands */
    SCMPChangeDeviceList: 0x11,
    SCMPChangeDeviceListReplyLength: 0,
    SCMPStatusRequest: 0x12,
    SCMPStatusRequestReplyLength: null, //variable
    
    /** Pump Commands */
    SCPSetPointChangeRequest: 0x11,
    SCPSetPointChangeRequestReplyLength: 0,
    SCPPumpStatusRequest: 0x12,
    SCPPumpStatusRequestReplyLength: 5,
    SCPMemoryValueChangeRequest: 0x13,
    SCPMemoryValueChangeRequestReplyLength: 2,
    SCPMemoryValueRecallRequest: 0x14,
    SCPMemoryValueRecallRequestReplyLength: 2,
    SCPFillRequest: 0x15,
    SCPFillRequestReplyLength: 0,
    SCPConstantRequest: 0x16,
    SCPConstantRequestReplyLength: 8,
    SCPTickMarkLimitRequest: 0x18,
    SCPTickMarkLimitRequestReplyLength: 1,
    SCPSNRSRequest: 0x19,
    SCPSNRSRequestReplyLength: 1,
    SCPJobStatusRequest: 0x22,
    SCPJobStatusRequestReplyLength: 15,
    SCPPumpStateRequest: 0x1A,
    SCPPumpStateRequestReplyLength: 4,
    SCPLeakTestRequest: 0x60,
    SCPSelfTestRequest: 0x03,
    SCPSelfTestRequestReplyLength: 7,
    SCFirmwareRequest: 0x04,
    SCFirmwareRequestReplyLength: null,
    SCPFactoryResetRequest: 0x72,
    SCPFactoryResetRequestReplyLength: 0,
    
    /** Temperature Engine Commands */
    SCTESetPointRequest: 0x11,
    SCTEStatusRequest: 0x12,
    SCTEPowerRequest: 0x13,
    SCTEReadDataRequest: 0x14,
    SCTEReadEEPROMRequest: 0x16,
    SCTEWriteEEPROMRequest: 0x17,
    SCTE_FFTStatusRequest: 0x18,
    SCTEStartFFTRequest: 0x19,
    SCTESelfTestRequest: 0x03,
    
    /** Foundation Commands */
    SCFAdjustmentChangeRequest: 0x11,
    SCFAdjustmentChangeRequestReplyLength: 0,
    SCFOutletChangeRequest: 0x13,
    SCFOutletChangeRequestReplyLength: 0, //differs from documentation
    SCFAdjustmentStatusRequest: 0x12,
    SCFAdjustmentStatusRequestReplyLength: 15,
    SCFMassageStatusRequest: 0x1A,
    SCFMassageStatusRequestReplyLength: 11,
    SCFOutletStatusRequest: 0x14,
    SCFOutletStatusRequestReplyLength: 3,
    SCFActivatePresetRequest: 0x15,
    SCFActivatePresetRequestReplyLength: 0,
    SCFStorePresetRequest: 0x16,
    SCFStorePresetRequestReplyLength: 0,
    SCFReadPresetRequest: 0x18,
    SCFReadPresetRequestReplyLength: 2,
    SCFResetPresetRequest: 0x17,
    SCFResetPresetRequestReplyLength: 0,
    SCFMotionHalt: 0x19,
    SCFMotionHaltReplyLength: 0,
    SCFSystemSettingRequest: 0x24,
    SCFSystemSettingRequestReplyLength: 0,
    SCFSystemStatusRequest: 0x25,
    SCFSystemStatusRequestReplyLength: 7, //differs from documentation
    SCFSelfTestRequest: 0x03,
    SCFSelfTestRequestReplyLength: 1,
    
    /** SleepExpert Commands */
    SCSEShortWriteRequest: 0x1B,
    SCSEShortReadRequest: 0x1C,
    SCSELongRequest: 0x1D,
    
    /** Bridge Commands */
    SCBCommTestRequest: 0x7f,


    /** Node Classes */
    SCNC_TestFixture: 0x00,
    SCNC_PumpDevice: 0x01,
    SCNC_PumpController: 0x02,
    SCNC_Reserved_UARTHeader: 0x16,
    SCNC_FoundationDevice: 0x41,
    SCNC_FoundationController: 0x42,
    SCNC_SleepExpertDevice: 0x51,
    SCNC_SleepExpertController: 0x52,
    SCNC_TemperatureEngineDevice: 0x61,
    SCNC_TemperatureEngineController: 0x62,
    SCNC_MCRProxyDevice: 0x71,
    SCNC_MCRProxyController: 0x72,
    SCNC_BridgeDevice: 0x81,
    SCNC_BridgeController: 0x82,


    /** Serial Preamble */
    kSCMessagePreamble: '1616',

    // Sizes
    kSCMessageHeaderSize: 10,
    kSCMessageMaxPayload: 15,
    kSCMessageUARTPreSize: 2,
    kSCMessageUARTPostSize: 2,
    kSCMessageHdrUARTSize: 14, //(this.kSCMessageHeaderSize + this.kSCMessageUARTPreSize + this.kSCMessageUARTPostSize),
    kSCMessageMaxSize: 29, //(this.kSCMessageHdrUARTSize + this.kSCMessageMaxPayload),

    // Error Codes
    kSCMessageErrorNone: 0,
    kSCMessageErrorTimeout: 1,
    kSCMessageErrorNoBridge: 2,
    kSCMessageErrorNoDevice: 3,
    kSCMessageErrorCanceled: 4,
    kSCMessageErrorNAK: 5,



    //Timing
    ScanTime: 3, //s
    ConnectTime: 7, //s
    kSCMessageSegmentGap: 10, //ms
    KeepAliveInterval: 800, //ms
    ReconnectInterval: 800, //ms


    // Timeouts and Retries
    kSCMessageShortTimeout: 3,   // was 0.1.  Adding BLE transfer time.  Could be long in noisy environments
    kSCMessageLongTimeout: 5,   // was 0.9.  or over greater distances.
    kSCMessageRetryCount: 3,

    RSSIRangeLimit: -95

  };

  return SelectComfortConstants;
});