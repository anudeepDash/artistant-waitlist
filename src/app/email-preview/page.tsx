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
      background-color: #fafafa;
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
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
      .content-card {
        padding: 30px 20px !important;
      }
      .cta-button {
        width: 100% !important;
        display: block !important;
        box-sizing: border-box;
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
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Explore your latest updates and creative syncs on ArtisTant.
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 20px 0 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); text-align: left;">
          
          <!-- Branded Dark Header -->
          <tr>
            <td style="background-color: #0b1120; padding: 25px 30px; border-top-left-radius: 19px; border-top-right-radius: 19px;">
              <a href="{{cta_url}}" target="_blank" style="text-decoration: none; display: block;">
                <img src="https://artistant.in/logo_wordmark.png" alt="ArtisTant Logo" width="150" style="display: block; width: 150px; height: auto; border: 0; outline: none;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_wordmark.png';">
              </a>
            </td>
          </tr>

          <!-- 3px Gradient Line Divider under Header -->
          <tr>
            <td height="3" style="height: 3px; font-size: 0px; line-height: 0px; background: #F25A2B; background: linear-gradient(90deg, #F25A2B 0%, #D4567A 40%, #7C5CFF 75%, #6B7CDB 100%);">
              &nbsp;
            </td>
          </tr>

          <!-- Email Body Content Area -->
          <tr>
            <td class="content-card" style="padding: 40px 30px; background-color: #ffffff; {{watermark_style}}">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:598px;height:400px;">
                <v:fill type="frame" src="https://artistant.in/logo_a_watermark.png" color="#ffffff" opacity="5%" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div>
                
                <!-- Greeting -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: bold; line-height: 24px; color: #111111;">
                        Hey <span style="color: #F25A2B;">{{name}}</span>,
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Message Body -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 30px; font-size: 14px; line-height: 1.6; color: #333333;">
                      <div style="margin: 0; min-height: 120px;">
                        {{message}}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Call To Action Button -->
                <!-- cta_section_start -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="left" style="padding-bottom: 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: auto;">
                        <tr>
                          <td align="center" style="border-radius: 8px; background-color: #F25A2B;">
                            <!--[if mso]>
                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{cta_url}}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="18%" stroke="f" fillcolor="#F25A2B">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">{{cta_text}}</center>
                              </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a class="cta-button" href="{{cta_url}}" target="_blank" style="font-size: 15px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 11px 24px; border: 1px solid #F25A2B; display: inline-block; font-weight: bold; background: #F25A2B; background: linear-gradient(135deg, #F25A2B 0%, #D4567A 100%); box-shadow: 0 4px 10px rgba(242, 90, 43, 0.2);">
                              {{cta_text}}
                            </a>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- cta_section_end -->

                <!-- Contact & Queries -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-top: 15px; border-top: 1px solid #eaeaea; font-size: 12px; line-height: 18px; color: #999999;">
                      If you have any questions or did not sign up for this, please contact us at <a href="mailto:hello@artistant.in" style="color: #7C5CFF; text-decoration: none;">hello@artistant.in</a>.
                    </td>
                  </tr>
                </table>

              </div>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Divider Line -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fafafa; padding: 25px 30px; border-bottom-left-radius: 19px; border-bottom-right-radius: 19px;">
              
              <!-- Social Icons -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; border-collapse: collapse; margin-left: auto; margin-right: auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://instagram.com/artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/instagram-new.png" alt="Instagram" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://linkedin.com/company/artistant" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/linkedin.png" alt="LinkedIn" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/domain.png" alt="Website" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Brand Copyright -->
              <p style="font-size: 9px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; line-height: 1.4; font-family: sans-serif; text-align: center;">
                © 2026 ARTISTANT. ALL RIGHTS RESERVED.
              </p>
              
              <p style="font-size: 8px; color: #aaaaaa; margin: 0; line-height: 1.3; font-family: sans-serif; letter-spacing: 0.5px; text-align: center;">
                The Ultimate Creative Link-up &bull; Live Entertainment Ecosystem
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Raw Normal template matching src/templates/artistant-normal-mail-template.html (Light card)
const NORMAL_TEMPLATE_RAW = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ArtisTant Update</title>
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
      background-color: #fafafa;
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
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
      .content-card {
        padding: 30px 20px !important;
      }
      .cta-button {
        width: 100% !important;
        display: block !important;
        box-sizing: border-box;
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
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    An update from ArtisTant, the live entertainment ecosystem.
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 20px 0 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); text-align: left;">
          
          <!-- Branded Dark Header -->
          <tr>
            <td style="background-color: #0b1120; padding: 25px 30px; border-top-left-radius: 19px; border-top-right-radius: 19px;">
              <a href="{{cta_url}}" target="_blank" style="text-decoration: none; display: block;">
                <img src="https://artistant.in/logo_wordmark.png" alt="ArtisTant Logo" width="150" style="display: block; width: 150px; height: auto; border: 0; outline: none;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_wordmark.png';">
              </a>
            </td>
          </tr>

          <!-- 3px Gradient Line Divider under Header -->
          <tr>
            <td height="3" style="height: 3px; font-size: 0px; line-height: 0px; background: #F25A2B; background: linear-gradient(90deg, #F25A2B 0%, #D4567A 40%, #7C5CFF 75%, #6B7CDB 100%);">
              &nbsp;
            </td>
          </tr>

          <!-- Email Body Content Area -->
          <tr>
            <td class="content-card" style="padding: 40px 30px; background-color: #ffffff; {{watermark_style}}">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:598px;height:400px;">
                <v:fill type="frame" src="https://artistant.in/logo_a_watermark.png" color="#ffffff" opacity="5%" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div>
                
                <!-- Greeting -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: bold; line-height: 20px; color: #111111;">
                        Hello {{name}},
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Message Body -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 30px; font-size: 14px; line-height: 1.6; color: #333333;">
                      <div style="margin: 0; min-height: 120px;">
                        {{message}}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Optional Call To Action Button -->
                <!-- cta_section_start -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="left" style="padding-bottom: 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: auto;">
                        <tr>
                          <td align="center" style="border-radius: 8px; background-color: #F25A2B;">
                            <!--[if mso]>
                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{cta_url}}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="18%" stroke="f" fillcolor="#F25A2B">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">{{cta_text}}</center>
                              </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a class="cta-button" href="{{cta_url}}" target="_blank" style="font-size: 15px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 11px 24px; border: 1px solid #F25A2B; display: inline-block; font-weight: bold; background: #F25A2B; background: linear-gradient(135deg, #F25A2B 0%, #D4567A 100%); box-shadow: 0 4px 10px rgba(242, 90, 43, 0.2);">
                              {{cta_text}}
                            </a>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- cta_section_end -->

                <!-- Contact & Queries -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-top: 15px; border-top: 1px solid #eaeaea; font-size: 12px; line-height: 18px; color: #999999;">
                      For any inquiries, reach us at <a href="mailto:hello@artistant.in" style="color: #7C5CFF; text-decoration: none;">hello@artistant.in</a>.
                    </td>
                  </tr>
                </table>

              </div>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Divider Line -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fafafa; padding: 25px 30px; border-bottom-left-radius: 19px; border-bottom-right-radius: 19px;">
              
              <!-- Social Icons -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; border-collapse: collapse; margin-left: auto; margin-right: auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://instagram.com/artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/instagram-new.png" alt="Instagram" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://linkedin.com/company/artistant" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/linkedin.png" alt="LinkedIn" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://artistant.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/888888/domain.png" alt="Website" width="16" height="16" style="width: 16px; height: 16px; display: block; opacity: 0.6;">
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Brand Copyright -->
              <p style="font-size: 9px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; line-height: 1.4; font-family: sans-serif; text-align: center;">
                © 2026 ARTISTANT. ALL RIGHTS RESERVED.
              </p>
              
              <p style="font-size: 8px; color: #aaaaaa; margin: 0; line-height: 1.3; font-family: sans-serif; letter-spacing: 0.5px; text-align: center;">
                The Ultimate Creative Link-up &bull; Live Entertainment Ecosystem
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const DEFAULT_WELCOME_MSG = "You've taken the first step toward the ultimate creative link-up. We're thrilled to welcome you to the waitlist of ArtisTant, the unified ecosystem for live entertainment.\n\nYour spot has been reserved. Keep an eye out for updates as we roll out exclusive early access, feature updates, and first-dibs on username claims.";
const DEFAULT_NORMAL_MSG = "Thank you for being a vital part of ArtisTant. We wanted to reach out and share some exciting developments happening behind the scenes as we gear up for launch.\n\nOur curation algorithm is getting final optimizations, and early dashboard access will roll out in phases. If you have colleagues or partners who should claim their handle early, please share your invite link.\n\nLet's build the ultimate creative ecosystem together.";

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'welcome' | 'normal'>('welcome');
  const [name, setName] = useState('Anudeep');
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
