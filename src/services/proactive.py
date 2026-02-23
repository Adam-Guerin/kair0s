"""
Kair0s Proactive Context Service
Détection automatique du contexte écran + suggestions intelligentes
Synergie parfaite entre OpenClaw et l'application
"""

import asyncio
import logging
import base64
import io
from typing import Optional, Dict, List, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import json
import time
import os
from pathlib import Path

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# TYPES ET ENUMS
# ============================================================================

class ContextType(Enum):
    """Types de contexte détectés"""
    SCREENSHOT = "screenshot"
    CODE_EDITOR = "code_editor"
    TERMINAL = "terminal"
    BROWSER = "browser"
    DOCUMENT = "document"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    CHAT = "chat"
    UNKNOWN = "unknown"

class SuggestionType(Enum):
    """Types de suggestions proactives"""
    SUMMARIZE = "summarize"
    EXPLAIN_CODE = "explain_code"
    ANALYZE_TABLE = "analyze_table"
    GENERATE_CODE = "generate_code"
    FIX_ISSUE = "fix_issue"
    OPTIMIZE = "optimize"
    TRANSLATE = "translate"
    DOCUMENTATION = "documentation"

@dataclass
class ScreenRegion:
    """Région d'écran détectée"""
    x: int
    y: int
    width: int
    height: int
    content_type: str
    confidence: float
    text: Optional[str] = None
    elements: List[Dict[str, Any]] = None

@dataclass
class ContextAnalysis:
    """Analyse complète du contexte"""
    timestamp: float
    context_type: ContextType
    regions: List[ScreenRegion]
    dominant_content: str
    confidence: float
    metadata: Dict[str, Any]

@dataclass
class Suggestion:
    """Suggestion proactive"""
    type: SuggestionType
    title: str
    description: str
    confidence: float
    action: Optional[Dict[str, Any]] = None
    priority: str = "medium"

# ============================================================================
# SERVICES EXTERNES
# ============================================================================

class OpenClawIntegration:
    """Intégration avec OpenClaw pour traitement intelligent"""
    
    def __init__(self):
        self.api_endpoint = "http://localhost:18789/api/v1"
        self.session_id = None
    
    async def initialize_session(self) -> bool:
        """Initialiser une session OpenClaw"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                data = {
                    "action": "start_session",
                    "context": "proactive_analysis"
                }
                async with session.post(f"{self.api_endpoint}/session", json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        self.session_id = result.get("session_id")
                        logger.info(f"Session OpenClaw initialisée: {self.session_id}")
                        return True
        except Exception as e:
            logger.error(f"Erreur initialisation session OpenClaw: {e}")
        return False
    
    async def process_context(self, analysis: ContextAnalysis) -> Dict[str, Any]:
        """Traiter le contexte avec OpenClaw"""
        if not self.session_id:
            await self.initialize_session()
        
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                data = {
                    "session_id": self.session_id,
                    "action": "process_context",
                    "context": {
                        "type": analysis.context_type.value,
                        "regions": [
                            {
                                "x": r.x,
                                "y": r.y,
                                "width": r.width,
                                "height": r.height,
                                "content_type": r.content_type,
                                "confidence": r.confidence,
                                "text": r.text,
                                "elements": r.elements or []
                            }
                            for r in analysis.regions
                        ],
                        "dominant_content": analysis.dominant_content,
                        "metadata": analysis.metadata
                    }
                }
                
                async with session.post(f"{self.api_endpoint}/process", json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result
        except Exception as e:
            logger.error(f"Erreur traitement contexte OpenClaw: {e}")
            return {"error": str(e)}
    
    async def generate_suggestions(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Générer des suggestions basées sur le contexte"""
        suggestions = []
        
        # Analyser le type de contenu
        if analysis.context_type == ContextType.CODE_EDITOR:
            suggestions.extend(self._analyze_code_context(analysis))
        elif analysis.context_type == ContextType.SPREADSHEET:
            suggestions.extend(self._analyze_spreadsheet_context(analysis))
        elif analysis.context_type == ContextType.DOCUMENT:
            suggestions.extend(self._analyze_document_context(analysis))
        elif analysis.context_type == ContextType.BROWSER:
            suggestions.extend(self._analyze_browser_context(analysis))
        elif analysis.context_type == ContextType.TERMINAL:
            suggestions.extend(self._analyze_terminal_context(analysis))
        
        # Suggestions génériques basées sur le contenu dominant
        if "code" in analysis.dominant_content.lower():
            suggestions.append(Suggestion(
                type=SuggestionType.EXPLAIN_CODE,
                title="Expliquer le code",
                description="Analyser et expliquer le code affiché à l'écran",
                confidence=0.8,
                priority="high"
            ))
        
        if "error" in analysis.dominant_content.lower() or "exception" in analysis.dominant_content.lower():
            suggestions.append(Suggestion(
                type=SuggestionType.FIX_ISSUE,
                title="Corriger l'erreur",
                description="Détecter et proposer une correction pour l'erreur visible",
                confidence=0.9,
                priority="high"
            ))
        
        return suggestions
    
    def _analyze_code_context(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Analyser spécifiquement le contexte code"""
        suggestions = []
        
        for region in analysis.regions:
            if region.content_type == "code":
                suggestions.append(Suggestion(
                    type=SuggestionType.EXPLAIN_CODE,
                    title=f"Expliquer le code ({region.confidence:.1f})",
                    description=f"Analyser le code dans la région ({region.x}, {region.y})",
                    confidence=region.confidence,
                    action={"region": {"x": region.x, "y": region.y, "width": region.width, "height": region.height}}
                ))
                
                if "error" in (region.text or "").lower() or "exception" in (region.text or "").lower():
                    suggestions.append(Suggestion(
                        type=SuggestionType.FIX_ISSUE,
                        title="Corriger l'erreur de code",
                        description="Proposer une correction pour l'erreur détectée",
                        confidence=region.confidence,
                        priority="high",
                        action={"region": {"x": region.x, "y": region.y, "width": region.width, "height": region.height}}
                    ))
        
        return suggestions
    
    def _analyze_spreadsheet_context(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Analyser le contexte tableur"""
        suggestions = []
        
        for region in analysis.regions:
            if region.content_type == "table":
                suggestions.append(Suggestion(
                    type=SuggestionType.ANALYZE_TABLE,
                    title="Analyser le tableau",
                    description="Extraire et analyser les données du tableau",
                    confidence=region.confidence,
                    action={"region": {"x": region.x, "y": region.y, "width": region.width, "height": region.height}}
                ))
        
        return suggestions
    
    def _analyze_document_context(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Analyser le contexte document"""
        suggestions = []
        
        suggestions.append(Suggestion(
            type=SuggestionType.SUMMARIZE,
            title="Résumer le document",
            description="Générer un résumé intelligent du document affiché",
            confidence=0.7,
            priority="medium"
        ))
        
        return suggestions
    
    def _analyze_browser_context(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Analyser le contexte navigateur"""
        suggestions = []
        
        suggestions.append(Suggestion(
            type=SuggestionType.SUMMARIZE,
            title="Résumer la page web",
            description="Extraire et résumer le contenu de la page affichée",
            confidence=0.6,
            priority="medium"
        ))
        
        return suggestions
    
    def _analyze_terminal_context(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Analyser le contexte terminal"""
        suggestions = []
        
        for region in analysis.regions:
            if region.content_type == "terminal":
                suggestions.append(Suggestion(
                    type=SuggestionType.EXPLAIN_CODE,
                    title="Expliquer la commande",
                    description=f"Expliquer la commande ou l'erreur dans le terminal: {region.text}",
                    confidence=region.confidence,
                    action={"command": region.text}
                ))
        
        return suggestions

# ============================================================================
# SERVICE PRINCIPAL
# ============================================================================

class ProactiveContextService:
    """Service principal de contexte proactif"""
    
    def __init__(self):
        self.openclaw = OpenClawIntegration()
        self.last_analysis = None
        self.analysis_cache = {}
        self.suggestion_cache = {}
    
    async def capture_screen(self) -> Optional[bytes]:
        """Capturer l'écran (simulation pour développement)"""
        try:
            # En production, utiliser une vraie capture d'écran
            # Pour le développement, simuler avec une image de test
            test_image_path = Path(__file__).parent / "test_screenshot.png"
            if test_image_path.exists():
                with open(test_image_path, "rb") as f:
                    return f.read()
            else:
                logger.warning("Image de test non trouvée, utilisation d'une capture simulée")
                return b"simulated_screenshot_data"
        except Exception as e:
            logger.error(f"Erreur capture écran: {e}")
            return None
    
    async def analyze_screenshot(self, image_data: bytes) -> ContextAnalysis:
        """Analyser la capture d'écran avec OCR et détection"""
        try:
            # Simuler l'analyse OCR (en production, utiliser Tesseract/PaddleOCR)
            regions = self._simulate_ocr_analysis(image_data)
            
            # Déterminer le type de contexte dominant
            context_type = self._determine_context_type(regions)
            
            # Contenu dominant
            dominant_content = self._extract_dominant_content(regions)
            
            analysis = ContextAnalysis(
                timestamp=time.time(),
                context_type=context_type,
                regions=regions,
                dominant_content=dominant_content,
                confidence=0.8,  # Confiance simulée
                metadata={
                    "image_size": len(image_data),
                    "regions_count": len(regions),
                    "processing_time": 0.1
                }
            )
            
            self.last_analysis = analysis
            logger.info(f"Analyse contexte: {context_type.value} - {dominant_content}")
            return analysis
            
        except Exception as e:
            logger.error(f"Erreur analyse screenshot: {e}")
            return ContextAnalysis(
                timestamp=time.time(),
                context_type=ContextType.UNKNOWN,
                regions=[],
                dominant_content="error",
                confidence=0.0,
                metadata={"error": str(e)}
            )
    
    def _simulate_ocr_analysis(self, image_data: bytes) -> List[ScreenRegion]:
        """Simuler l'analyse OCR (remplacer par vraie OCR en production)"""
        # Simulation basique - en production utiliser Tesseract, PaddleOCR, etc.
        regions = [
            ScreenRegion(
                x=100, y=100, width=400, height=300,
                content_type="code_editor",
                confidence=0.9,
                text="def calculate_sum(items):\n    return sum(items) / len(items)",
                elements=[{"type": "function", "name": "calculate_sum"}]
            ),
            ScreenRegion(
                x=550, y=100, width=300, height=200,
                content_type="terminal",
                confidence=0.8,
                text="python main.py --verbose",
                elements=[{"type": "command", "text": "python main.py --verbose"}]
            ),
            ScreenRegion(
                x=100, y=450, width=600, height=200,
                content_type="browser",
                confidence=0.7,
                text="https://github.com/kair0s/documentation",
                elements=[{"type": "url", "text": "https://github.com/kair0s/documentation"}]
            )
        ]
        return regions
    
    def _determine_context_type(self, regions: List[ScreenRegion]) -> ContextType:
        """Déterminer le type de contexte principal"""
        content_types = [r.content_type for r in regions]
        
        if "code_editor" in content_types:
            return ContextType.CODE_EDITOR
        elif "terminal" in content_types:
            return ContextType.TERMINAL
        elif "browser" in content_types:
            return ContextType.BROWSER
        elif "table" in content_types:
            return ContextType.SPREADSHEET
        elif "document" in content_types:
            return ContextType.DOCUMENT
        else:
            return ContextType.UNKNOWN
    
    def _extract_dominant_content(self, regions: List[ScreenRegion]) -> str:
        """Extraire le contenu dominant de l'analyse"""
        content_texts = []
        
        for region in regions:
            if region.text:
                content_texts.append(region.text)
            if region.elements:
                for element in region.elements:
                    if isinstance(element, dict) and "text" in element:
                        content_texts.append(element["text"])
        
        if content_texts:
            # Combiner et analyser le texte dominant
            combined_text = " ".join(content_texts).lower()
            
            if any(word in combined_text for word in ["def", "function", "class", "import"]):
                return "code_editor_with_functions"
            elif any(word in combined_text for word in ["error", "exception", "traceback"]):
                return "code_with_errors"
            elif any(word in combined_text for word in ["table", "data", "rows", "columns"]):
                return "spreadsheet_data"
            elif any(word in combined_text for word in ["http", "www", "url"]):
                return "web_page"
            else:
                return "mixed_content"
        
        return "unknown"
    
    async def generate_proactive_suggestions(self, analysis: ContextAnalysis) -> List[Suggestion]:
        """Générer des suggestions proactives"""
        # Utiliser OpenClaw pour générer des suggestions intelligentes
        openclaw_suggestions = await self.openclaw.generate_suggestions(analysis)
        
        # Compléter avec des suggestions locales
        local_suggestions = [
            Suggestion(
                type=SuggestionType.SUMMARIZE,
                title="Résumer le contexte",
                description="Générer un résumé intelligent de ce qui est affiché",
                confidence=0.7,
                priority="medium"
            ),
            Suggestion(
                type=SuggestionType.DOCUMENTATION,
                title="Générer de la documentation",
                description="Créer de la documentation basée sur le code visible",
                confidence=0.6,
                priority="low"
            )
        ]
        
        # Fusionner et dédupliquer
        all_suggestions = openclaw_suggestions + local_suggestions
        unique_suggestions = []
        seen = set()
        
        for suggestion in all_suggestions:
            key = f"{suggestion.type.value}_{suggestion.title}"
            if key not in seen:
                seen.add(key)
                unique_suggestions.append(suggestion)
        
        # Trier par confiance et priorité
        priority_order = {"high": 3, "medium": 2, "low": 1}
        unique_suggestions.sort(
            key=lambda s: (s.confidence * priority_order.get(s.priority, 2)),
            reverse=True
        )
        
        return unique_suggestions[:5]  # Limiter à 5 suggestions principales
    
    async def process_screenshot_with_context(self, image_data: bytes) -> Dict[str, Any]:
        """Traiter la capture d'écran avec contexte complet"""
        # 1. Analyser la capture
        analysis = await self.analyze_screenshot(image_data)
        
        # 2. Envoyer à OpenClaw pour traitement intelligent
        openclaw_result = await self.openclaw.process_context(analysis)
        
        # 3. Générer des suggestions proactives
        suggestions = await self.generate_proactive_suggestions(analysis)
        
        # 4. Construire la réponse complète
        result = {
            "timestamp": analysis.timestamp,
            "analysis": {
                "context_type": analysis.context_type.value,
                "dominant_content": analysis.dominant_content,
                "confidence": analysis.confidence,
                "regions_count": len(analysis.regions),
                "metadata": analysis.metadata
            },
            "openclaw_processing": openclaw_result,
            "suggestions": [
                {
                    "type": s.type.value,
                    "title": s.title,
                    "description": s.description,
                    "confidence": s.confidence,
                    "priority": s.priority,
                    "action": s.action
                }
                for s in suggestions
            ],
            "next_actions": [
                "Afficher les suggestions dans l'interface Kair0s",
                "Préparer une session OpenClaw basée sur le contexte",
                "Mettre à jour les presets métier si applicable"
            ]
        }
        
        logger.info(f"Traitement proactif complété: {len(suggestions)} suggestions générées")
        return result

# ============================================================================
# POINT D'ENTÉE PRINCIPAL
# ============================================================================

async def main():
    """Point d'entrée principal du service proactif"""
    service = ProactiveContextService()
    
    logger.info("Démarrage du service de contexte proactif Kair0s")
    
    try:
        # Simuler une capture d'écran
        image_data = await service.capture_screen()
        
        if image_data:
            # Traiter avec contexte complet
            result = await service.process_screenshot_with_context(image_data)
            
            # Afficher les résultats (en production, envoyer à l'interface Kair0s)
            print("=== RÉSULTATS DU TRAITEMENT PROACTIF ===")
            print(f"Type de contexte: {result['analysis']['context_type']}")
            print(f"Contenu dominant: {result['analysis']['dominant_content']}")
            print(f"Confiance: {result['analysis']['confidence']:.2f}")
            print(f"\n--- SUGGESTIONS PROACTIVES ---")
            
            for i, suggestion in enumerate(result['suggestions'], 1):
                print(f"{i}. {suggestion['title']} ({suggestion['confidence']:.2f})")
                print(f"   {suggestion['description']}")
                print(f"   Priorité: {suggestion['priority']}")
                print()
            
            print("--- ACTIONS SUGGÉRÉES ---")
            for action in result['next_actions']:
                print(f"• {action}")
        else:
            logger.error("Impossible de capturer l'écran")
            
    except Exception as e:
        logger.error(f"Erreur dans le service proactif: {e}")

if __name__ == "__main__":
    asyncio.run(main())
