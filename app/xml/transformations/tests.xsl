<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes" encoding="UTF-8" />

  <xsl:template match="/">
    <html>
      <head>
        <title>Typing Test Results</title>
        <link rel="stylesheet" type="text/css" href="../css/styles.css" />
        <script src="../controllers/progress-graph.js" defer="defer"></script>
        <script src="../controllers/heatmap.js" defer="defer"></script>
      </head>
      <body>
        <div class="test-container">
          <div class="test-details">
            <xsl:apply-templates select="typing_test" />
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="typing_test">
    <div class="test-info">
        <h2>Typing Test Results</h2>
        <div class="test-summary">
            <p><strong>Language:</strong> <xsl:value-of select="info/language" /> (<xsl:value-of select="info/type" />)</p>
            <p><strong>Duration:</strong> <xsl:value-of select="info/duration" /> seconds</p>
            <p><strong>WPM:</strong> <xsl:value-of select="format-number(info/wpm, '#0.0')" /></p>
            <p><strong>Accuracy:</strong> <xsl:value-of select="format-number(info/accuracy, '#0.0')" />%</p>
            <p><strong>Date:</strong> <xsl:value-of select="substring(info/date, 1, 19)" /></p>
        </div>
    </div>

    <xsl:if test="details">
        <div class="test-details-container">
            <!-- Progress Graph -->
            <div class="progress-graph">
                <h3>Progress Graph</h3>
                <div class="graph-container" id="progress-graph-container">
                    <canvas id="progress-graph-canvas"></canvas>
                    <div class="progress-data" style="display:none;">
                        <xsl:for-each select="details/progress/time_point">
                            <div class="data-point" 
                                 data-seconds="{@seconds}" 
                                 data-wpm="{@wpm}" 
                                 data-errors="{@errors}">
                            </div>
                        </xsl:for-each>
                    </div>
                </div>
            </div>

            <!-- Problematic Characters Heatmap -->
            <div class="heatmap-container" id="char-heatmap-container">
                <h3>Character Heatmap</h3>
                <div class="char-data" style="display:none;">
                    <xsl:for-each select="details/problematic_chars/char">
                        <div class="char-item" 
                             data-char="{@value}" 
                             data-count="{@count}">
                        </div>
                    </xsl:for-each>
                </div>
            </div>

            <!-- Problematic Words -->
            <div class="problematic-words">
                <h3>Problematic Words</h3>
                <ul>
                    <xsl:for-each select="details/problematic_words/word">
                        <li>
                            <span class="word"><xsl:value-of select="@value" /></span>
                            <span class="count">(<xsl:value-of select="@count" /> errors)</span>
                        </li>
                    </xsl:for-each>
                </ul>
            </div>
        </div>
    </xsl:if>

    <div class="actions result-actions">
        <a href="test.php" class="button primary">Take New Test</a>
        <a href="profile.php" class="button secondary">Back to Profile</a>
    </div>
  </xsl:template>

</xsl:stylesheet>