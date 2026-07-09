'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Monitor, 
  Smartphone, 
  Mail, 
  ExternalLink, 
  FileCode, 
  Settings 
} from 'lucide-react';

// Custom inline SVG icons for social media
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Raw Welcome template matching src/templates/artistant-mail-template.html (Light card)
const WELCOME_TEMPLATE_RAW = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ArtisTant Welcome</title>
  <style>
    /* Reset Styles */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F8FAFC;
    }

    /* iOS Blue Links Override */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* Responsive Styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .content-card {
        padding: 30px 16px !important;
      }
      .ticket-table {
        border-radius: 12px !important;
      }
      .ticket-left, .ticket-right {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
      .ticket-left {
        border-right: none !important;
        border-bottom: 2px dashed #334155 !important;
        padding: 20px !important;
      }
      .ticket-right {
        padding: 20px !important;
        text-align: left !important;
      }
      .cta-button {
        width: 100% !important;
        display: block !important;
        box-sizing: border-box;
        text-align: center !important;
      }
    }
  </style>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Your ArtisTant username @{{username}} is officially secured! 🚀
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 20px 0 40px 0;">
        <!-- Email Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); text-align: left;">
          
          <!-- Branded Dark Header -->
          <tr>
            <td style="background-color: #0b1120; padding: 25px 30px; border-top-left-radius: 19px; border-top-right-radius: 19px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left">
                    <a href="{{cta_url}}" target="_blank" style="text-decoration: none; display: block;">
                      <img src="https://artistant.in/logo_wordmark.png" alt="ArtisTant Logo" width="130" style="display: block; width: 130px; height: auto; border: 0; outline: none;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_wordmark.png';">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Gradient Border Strip -->
          <tr>
            <td height="4" style="background: #F25A2B; background: linear-gradient(90deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%); line-height: 4px; font-size: 0px; padding: 0;">&nbsp;</td>
          </tr>

          <!-- Email Body Content Area -->
          <tr>
            <td class="content-card" style="padding: 40px 35px; background-color: #ffffff; position: relative; overflow: hidden; {{watermark_style}}">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:598px;height:400px;">
                <v:fill type="frame" src="https://artistant.in/logo_a_watermark.png" color="#ffffff" opacity="4%" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div style="position: relative; z-index: 2;">
                
                <!-- Pill Badge -->
                <div style="display: inline-block; background-color: #FFF0EB; border: 1px solid #FFD4C7; color: #F25A2B; font-size: 10px; font-weight: 800; padding: 6px 14px; border-radius: 99px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 25px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                  ⚡ WAITLIST ACTIVE
                </div>

                <!-- Main Heading -->
                <h1 style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 900; line-height: 1.25; color: #0F172A; letter-spacing: -0.5px;">
                  Welcome to the stage. <br><span style="color: #F25A2B;">@{{username}}</span> is officially stashed.
                </h1>

                <!-- Greeting -->
                <p style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0F172A;">
                  Hey {{name}},
                </p>

                <!-- Message Body -->
                <div style="margin: 0 0 35px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  {{message}}
                </div>

                <!-- Unique Custom Pioneer Ticket (Stage Pass) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="ticket-table" style="background-color: #0F172A; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B; margin-bottom: 35px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                  <!-- Ticket Top Accent Glow -->
                  <tr>
                    <td colspan="2" height="3" style="background: linear-gradient(90deg, #F25A2B 0%, #7C5CFF 100%); line-height: 3px; font-size: 0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <!-- Ticket Main Body (Left Side) -->
                    <td class="ticket-left" valign="top" style="padding: 24px; border-right: 2px dashed #1E293B; width: 68%;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <!-- Ticket Icon & Label -->
                          <td style="padding-bottom: 20px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-right: 8px;">
                                  <img src="https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a.png" alt="" width="20" height="20" style="display: block; width: 20px; height: 20px;">
                                </td>
                                <td>
                                  <span style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 9px; font-weight: 800; color: #7C5CFF; letter-spacing: 2px; text-transform: uppercase;">ARTISTANT PIONEER PASS</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Artist Credentials -->
                        <tr>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td style="padding-bottom: 12px; width: 50%;">
                                  <span style="display: block; font-size: 8px; font-weight: 800; color: #5C6680; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">PASSENGER / ARTIST</span>
                                  <span style="font-size: 13px; font-weight: 700; color: #ffffff;">{{name}}</span>
                                </td>
                                <td style="padding-bottom: 12px; width: 50%;">
                                  <span style="display: block; font-size: 8px; font-weight: 800; color: #5C6680; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">STAGE IDENTITY</span>
                                  <span style="font-size: 13px; font-weight: 700; color: #F25A2B;">@{{username}}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-top: 4px;">
                                  <span style="display: block; font-size: 8px; font-weight: 800; color: #5C6680; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">NODE / ACCESS TYPE</span>
                                  <span style="font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">EARLY PIONEER</span>
                                </td>
                                <td style="padding-top: 4px;">
                                  <span style="display: block; font-size: 8px; font-weight: 800; color: #5C6680; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">VERIFICATION STATE</span>
                                  <span style="font-size: 11px; font-weight: 800; color: #10B981; letter-spacing: 0.5px;">✓ RESERVED</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <!-- Ticket Tear-off / Points Stub (Right Side) -->
                    <td class="ticket-right" valign="top" style="padding: 24px; text-align: center; background-color: #0B1120; width: 32%;">
                      <span style="display: block; font-size: 8px; font-weight: 800; color: #5C6680; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">WAITLIST POWER</span>
                      
                      <!-- Score Display -->
                      <div style="display: inline-block; background: linear-gradient(135deg, #F25A2B 0%, #D4567A 100%); padding: 12px 16px; border-radius: 12px; margin-bottom: 8px; box-shadow: 0 4px 10px rgba(242, 90, 43, 0.15);">
                        <span style="font-size: 20px; font-weight: 900; color: #ffffff; display: block; line-height: 1;">100</span>
                        <span style="font-size: 7px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; display: block; margin-top: 2px;">POINTS</span>
                      </div>

                      <span style="display: block; font-size: 9px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">Target: 250 PTS</span>
                      <span style="display: block; font-size: 8px; color: #7C5CFF; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px;">Cohort 1 Pass</span>
                    </td>
                  </tr>
                  
                  <!-- Ticket Barcode Footer Section -->
                  <tr>
                    <td colspan="2" style="background-color: #0A0F1D; padding: 16px 24px; border-top: 1px solid #1E293B; text-align: center;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <!-- Mock Barcode Graphic -->
                          <td align="center" style="padding-bottom: 6px;">
                            <img src="https://img.icons8.com/ios-glyphs/120/ffffff/barcode.png" alt="Barcode" width="140" height="28" style="display: block; width: 140px; height: 28px; opacity: 0.4; filter: invert(0);">
                          </td>
                        </tr>
                        <tr>
                          <td align="center">
                            <span style="font-family: monospace; font-size: 9px; color: #5C6680; letter-spacing: 4px;">ART-\${{username}}-2026</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Call to Action Button Section -->
                <!-- cta_section_start -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 10px 0 20px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{cta_url}}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" stroke="f" fillcolor="#7C5CFF">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">{{cta_text}}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a class="cta-button" href="{{cta_url}}" target="_blank" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-weight: bold; background: #7C5CFF; background: linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%); box-shadow: 0 5px 20px rgba(124, 92, 255, 0.25); text-transform: uppercase; letter-spacing: 0.5px;">
                        {{cta_text}}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
                <!-- cta_section_end -->

                <!-- Contact & Queries -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                  <tr>
                    <td style="padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11px; line-height: 16px; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                      If you have any questions or did not sign up for this, please contact us at <a href="mailto:hello@artistant.in" style="color: #7C5CFF; text-decoration: none; font-weight: 500;">hello@artistant.in</a>.
                    </td>
                  </tr>
                </table>

              </div>

              <!-- Background Logo Watermark (Cut off bottom-right) -->
              <div style="position: absolute; bottom: -50px; right: -50px; width: 220px; height: 220px; pointer-events: none; z-index: 1; opacity: 0.05;">
                <img src="https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a.png" alt="" width="220" height="220" style="display: block; width: 220px; height: 220px; border: 0; outline: none; opacity: 0.85;">
              </div>

              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F8FAFC; padding: 30px 30px; border-bottom-left-radius: 19px; border-bottom-right-radius: 19px; border-top: 1px solid #E2E8F0;">
              
              <!-- Social Icons -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; margin-left: auto; margin-right: auto;">
                <tr>
                  <td style="padding: 0 12px;">
                    <a href="https://instagram.com/artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/instagram-new.png" alt="Instagram" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="https://linkedin.com/company/artistant" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/linkedin.png" alt="LinkedIn" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="https://artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/domain.png" alt="Website" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Brand Copyright -->
              <p style="font-size: 9px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 8px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center;">
                © 2026 ARTISTANT. ALL RIGHTS RESERVED.
              </p>
              
              <!-- Tagline -->
              <p style="font-size: 8px; color: #94A3B8; margin: 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 1px; text-align: center;">
                THE ULTIMATE CREATIVE LINK-UP &bull; LIVE ENTERTAINMENT ECOSYSTEM
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Raw Normal template matching src/templates/artistant-normal-mail-template.html (Light card)
const NORMAL_TEMPLATE_RAW = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ArtisTant Email</title>
  <style>
    /* Reset Styles */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F8FAFC;
    }

    /* iOS Blue Links Override */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* Responsive Styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .content-card {
        padding: 30px 16px !important;
      }
      .cta-button {
        width: 100% !important;
        display: block !important;
        box-sizing: border-box;
        text-align: center !important;
      }
    }
  </style>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 20px 0 40px 0;">
        <!-- Email Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); text-align: left;">
          
          <!-- Branded Dark Header -->
          <tr>
            <td style="background-color: #0b1120; padding: 25px 30px; border-top-left-radius: 19px; border-top-right-radius: 19px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left">
                    <a href="{{cta_url}}" target="_blank" style="text-decoration: none; display: block;">
                      <img src="https://artistant.in/logo_wordmark.png" alt="ArtisTant Logo" width="130" style="display: block; width: 130px; height: auto; border: 0; outline: none;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_wordmark.png';">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Gradient Border Strip -->
          <tr>
            <td height="4" style="background: #7C5CFF; background: linear-gradient(90deg, #7C5CFF 0%, #D4567A 50%, #F25A2B 100%); line-height: 4px; font-size: 0px; padding: 0;">&nbsp;</td>
          </tr>

          <!-- Email Body Content Area -->
          <tr>
            <td class="content-card" style="padding: 40px 35px; background-color: #ffffff; position: relative; overflow: hidden; {{watermark_style}}">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:598px;height:400px;">
                <v:fill type="frame" src="https://artistant.in/logo_a_watermark.png" color="#ffffff" opacity="4%" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div style="position: relative; z-index: 2;">

                <!-- Greeting -->
                <p style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0F172A;">
                  Hey {{name}},
                </p>

                <!-- Message Body -->
                <div style="margin: 0 0 35px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  {{message}}
                </div>

                <!-- Call to Action Button Section -->
                <!-- cta_section_start -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 10px 0 20px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{cta_url}}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" stroke="f" fillcolor="#7C5CFF">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">{{cta_text}}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a class="cta-button" href="{{cta_url}}" target="_blank" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-weight: bold; background: #7C5CFF; background: linear-gradient(135deg, #7C5CFF 0%, #F25A2B 100%); box-shadow: 0 5px 20px rgba(124, 92, 255, 0.25); text-transform: uppercase; letter-spacing: 0.5px;">
                        {{cta_text}}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
                <!-- cta_section_end -->

                <!-- Contact & Queries -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                  <tr>
                    <td style="padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11px; line-height: 16px; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                      If you have any questions or did not sign up for this, please contact us at <a href="mailto:hello@artistant.in" style="color: #7C5CFF; text-decoration: none; font-weight: 500;">hello@artistant.in</a>.
                    </td>
                  </tr>
                </table>

              </div>

              <!-- Background Logo Watermark (Cut off bottom-right) -->
              <div style="position: absolute; bottom: -50px; right: -50px; width: 220px; height: 220px; pointer-events: none; z-index: 1; opacity: 0.05;">
                <img src="https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a.png" alt="" width="220" height="220" style="display: block; width: 220px; height: 220px; border: 0; outline: none; opacity: 0.85;">
              </div>

              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F8FAFC; padding: 30px 30px; border-bottom-left-radius: 19px; border-bottom-right-radius: 19px; border-top: 1px solid #E2E8F0;">
              
              <!-- Social Icons -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; margin-left: auto; margin-right: auto;">
                <tr>
                  <td style="padding: 0 12px;">
                    <a href="https://instagram.com/artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/instagram-new.png" alt="Instagram" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="https://linkedin.com/company/artistant" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/linkedin.png" alt="LinkedIn" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="https://artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/64748B/domain.png" alt="Website" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.8;">
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Brand Copyright -->
              <p style="font-size: 9px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 8px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center;">
                © 2026 ARTISTANT. ALL RIGHTS RESERVED.
              </p>
              
              <!-- Tagline -->
              <p style="font-size: 8px; color: #94A3B8; margin: 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 1px; text-align: center;">
                THE ULTIMATE CREATIVE LINK-UP &bull; LIVE ENTERTAINMENT ECOSYSTEM
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const DEFAULT_WELCOME_MSG = "[Type your email here]\n\nBest regards,\nTeam ArtisTant";
const DEFAULT_NORMAL_MSG = "[Type your email here]\n\nBest regards,\nTeam ArtisTant";

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'welcome' | 'normal'>('welcome');
  const [name, setName] = useState('Anudeep');
  const [username, setUsername] = useState('artist_name');
  const [username, setUsername] = useState('artist_name');
  const [message, setMessage] = useState(DEFAULT_WELCOME_MSG);
  const [ctaText, setCtaText] = useState('View Your Dashboard');
  const [ctaUrl, setCtaUrl] = useState('https://artistant.in/dashboard');
  const [useWatermark, setUseWatermark] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [copiedGmail, setCopiedGmail] = useState(false);

  // Swap default messages when template changes
  useEffect(() => {
    if (selectedTemplate === 'welcome') {
      setMessage(DEFAULT_WELCOME_MSG);
      setCtaText('View Your Dashboard');
      setCtaUrl('https://artistant.in/dashboard');
    } else {
      setMessage(DEFAULT_NORMAL_MSG);
      setCtaText('Check Out Updates');
      setCtaUrl('https://artistant.in');
    }
  }, [selectedTemplate]);

  // Compile HTML based on fields
  const compiledHtml = useMemo(() => {
    let html = selectedTemplate === 'welcome' ? WELCOME_TEMPLATE_RAW : NORMAL_TEMPLATE_RAW;
    
    // Replace Watermark style
    const watermarkStyle = useWatermark
      ? "background-image: url('https://artistant.in/logo_a_watermark.png'); background-image: url('https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a_watermark.png'), url('https://artistant.in/logo_a_watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 280px 280px;"
      : '';
    
    html = html.replace('{{watermark_style}}', watermarkStyle);
    html = html.replaceAll('{{name}}', name || 'there');
    html = html.replaceAll('{{username}}', username || 'artist_name');
    html = html.replaceAll('{{username}}', username || 'artist_name');
    html = html.replaceAll('{{username}}', username || 'artist_name');
    html = html.replaceAll('{{username}}', username || 'artist_name');
    html = html.replaceAll('{{message}}', message.replace(/\n/g, '<br />'));
    
    // Support dynamic CTA showing/hiding
    if (ctaText.trim() === '' || ctaUrl.trim() === '') {
      html = html.replace(/<!-- cta_section_start -->[\s\S]*?<!-- cta_section_end -->/g, '');
    } else {
      html = html.replaceAll('{{cta_text}}', ctaText);
      html = html.replaceAll('{{cta_url}}', ctaUrl);
    }
    
    return html;
  }, [selectedTemplate, name, message, ctaText, ctaUrl, useWatermark]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGmail = async () => {
    try {
      // Write the HTML to the clipboard as formatted rich text (MIME: text/html)
      const blob = new Blob([compiledHtml], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      await navigator.clipboard.write(data);
      setCopiedGmail(true);
      setTimeout(() => setCopiedGmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy rich text for Gmail:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F0EFF4] font-sans selection:bg-[#F25A2B] selection:text-white pb-12">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#7C5CFF]/10 to-[#F25A2B]/10 opacity-30 blur-[120px]" />
      
      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#0D1527]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo_a.png" alt="" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] bg-clip-text text-transparent">
                ArtisTant
              </span>
              <span className="text-xs text-[#9BA4B8] block font-mono tracking-wider uppercase">
                Email Studio
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Copy for Gmail (Pre-rendered Rich Text) */}
            <button
              onClick={handleCopyGmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg cursor-pointer bg-gradient-to-r from-[#F25A2B] to-[#D4567A] hover:shadow-[#F25A2B]/20 hover:scale-[1.02]"
            >
              {copiedGmail ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  <span>Ready to Paste in Gmail!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4.5 h-4.5" />
                  <span>Copy for Gmail (Rich Text)</span>
                </>
              )}
            </button>

            {/* Copy Source HTML */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg cursor-pointer border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:scale-[1.02]"
            >
              {copied ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  <span>Copied HTML!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4.5 h-4.5" />
                  <span>Copy Source HTML</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-white/5 bg-[#131C2E] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]" />
              
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-[#F25A2B]" />
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                  Template Settings
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Template Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                    Select Email Template
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#0B1120] p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setSelectedTemplate('welcome')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${selectedTemplate === 'welcome' ? 'bg-[#131C2E] text-white shadow' : 'text-[#9BA4B8] hover:text-[#F0EFF4]'}`}
                    >
                      Welcome Email
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('normal')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${selectedTemplate === 'normal' ? 'bg-[#131C2E] text-white shadow' : 'text-[#9BA4B8] hover:text-[#F0EFF4]'}`}
                    >
                      Normal Email
                    </button>
                  </div>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                    placeholder="Enter name"
                  />
                </div>

                {/* Reserved Username (Welcome only) */}
                {selectedTemplate === 'welcome' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                      Reserved Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                      placeholder="e.g. artist_brand"
                    />
                  </div>
                )}

                {/* Reserved Username (Welcome only) */}
                {selectedTemplate === 'welcome' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                      Reserved Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                      placeholder="e.g. artist_brand"
                    />
                  </div>
                )}

                {/* Reserved Username (Welcome only) */}
                {selectedTemplate === 'welcome' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                      Reserved Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                      placeholder="e.g. artist_brand"
                    />
                  </div>
                )}

                {/* Reserved Username (Welcome only) */}
                {selectedTemplate === 'welcome' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                      Reserved Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                      placeholder="e.g. artist_brand"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                    Email Message Body
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors resize-none leading-relaxed"
                    placeholder="Write email contents..."
                  />
                </div>

                {/* CTA text */}
                <div>
                  <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                    Button Label (CTA) <span className="text-[#5C6680] text-[10px] lowercase">(Leave blank to hide)</span>
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                    placeholder="e.g. View Dashboard"
                  />
                </div>

                {/* CTA URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#9BA4B8] uppercase tracking-wider mb-1.5">
                    Button Link URL
                  </label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F0EFF4] focus:outline-none focus:border-[#F25A2B] transition-colors"
                    placeholder="https://..."
                  />
                </div>

                {/* Watermark toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={useWatermark}
                        onChange={(e) => setUseWatermark(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${useWatermark ? 'bg-[#F25A2B]' : 'bg-[#0B1120] border border-white/10'}`} />
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${useWatermark ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-[#9BA4B8] group-hover:text-[#F0EFF4] transition-colors">
                      Enable watermark "A"
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Template Features Card */}
            <div className="border border-white/5 bg-[#131C2E]/60 rounded-2xl p-6 shadow-xl text-xs space-y-3 leading-relaxed text-[#9BA4B8]">
              <div className="flex items-center gap-2 mb-1 text-[#F0EFF4]">
                <FileCode className="w-4 h-4 text-[#7C5CFF]" />
                <span className="font-semibold uppercase tracking-wider">Email Template Features</span>
              </div>
              <p>
                • <strong>NewBi Style Light-Card:</strong> A gorgeous white card on a light-gray background with a dark brand header, simulating premium high-end concierge look & feel.
              </p>
              <p>
                • <strong>Responsive:</strong> Built using nested tables and inline CSS to ensure bulletproof delivery on Outlook, Gmail, Apple Mail, and mobile clients.
              </p>
              <p>
                • <strong>Auto Hide CTA:</strong> If you leave the Button Label empty, the preview generator strips the button HTML automatically.
              </p>
              <p>
                • <strong>Grey Socials:</strong> Social links in the footer styled with monochrome outlines for Instagram, LinkedIn, and Web.
              </p>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* View Mode Toolbar */}
            <div className="flex items-center justify-between border border-white/5 bg-[#131C2E] rounded-xl px-4 py-2.5 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="w-4 h-4 text-[#F25A2B]" />
                <span>Live Inbox View — {selectedTemplate === 'welcome' ? 'Welcome Template' : 'Normal Template'}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-[#0B1120] p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${previewMode === 'desktop' ? 'bg-[#131C2E] text-white' : 'text-[#9BA4B8] hover:text-white'}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${previewMode === 'mobile' ? 'bg-[#131C2E] text-white' : 'text-[#9BA4B8] hover:text-white'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Sandbox IFrame Container */}
            <div className="flex justify-center transition-all duration-300">
              <div 
                className="w-full border border-white/5 bg-[#0B1120] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
                style={{ 
                  maxWidth: previewMode === 'desktop' ? '100%' : '375px',
                  height: '700px'
                }}
              >
                <iframe
                  title="Email Template Preview"
                  srcDoc={compiledHtml}
                  className="w-full h-full border-0 bg-[#0B1120]"
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>

            {/* Links and Actions */}
            <div className="flex items-center justify-between text-xs text-[#9BA4B8] px-2">
              <div className="flex items-center gap-3">
                <a 
                  href="https://instagram.com/artistant.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <a 
                  href="https://linkedin.com/company/artistant" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
              <span>Theme: Light Card / Dark Brand Header</span>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
