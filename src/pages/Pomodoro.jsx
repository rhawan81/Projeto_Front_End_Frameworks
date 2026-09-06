import { useState, useEffect, useRef } from "react";
import { carregarAtividades } from "../data/storage";
import { useToast } from "../toast/ToastContext";
import { IconeRelogio, IconeSino } from "../icons";

const CHAVE_HISTORICO_POMODORO = "organizador-estudos:pomodoro-historico";

// Modos de Pomodoro em segundos
const MODOS = {
  foco: { rotulo: "Foco", segundos: 25 * 60, cor: "var(--cor-destaque, #2563eb)" },
  pausaCurta: { rotulo: "Pausa Curta", segundos: 5 * 60, cor: "#10b981" },
  pausaLonga: { rotulo: "Pausa Longa", segundos: 15 * 60, cor: "#8b5cf6" },
};

/**
 * Emite sinal sonoro suave utilizando a Web Audio API nativa.
 * Funciona offline e sem dependências de arquivos de áudio externos.
 */
function tocarAlarmeFim() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Primeiro tom (D5 - 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Segundo tom mais agudo em harmonia (A5 - 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (e) {
    console.warn("Não foi possível reproduzir o áudio:", e);
  }
}

export default function Pomodoro() {
  const { mostrarToast } = useToast();
  const [modo, setModo] = useState("foco");
  const [tempoRestante, setTempoRestante] = useState(MODOS.foco.segundos);
  const [ativo, setAtivo] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [materiaPersonalizada, setMateriaPersonalizada] = useState("");
  const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);
  const [historico, setHistorico] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_HISTORICO_POMODORO);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const intervaloRef = useRef(null);

  // Carrega matérias já existentes das atividades cadastradas
  useEffect(() => {
    const atividades = carregarAtividades();
    const lista = [...new Set(atividades.map((a) => a.materia).filter(Boolean))].sort();
    setMateriasDisponiveis(lista);
    if (lista.length > 0) {
      setMateriaSelecionada(lista[0]);
    } else {
      setMateriaSelecionada("Geral");
    }
  }, []);

  // Salva histórico no localStorage
  useEffect(() => {
    localStorage.setItem(CHAVE_HISTORICO_POMODORO, JSON.stringify(historico));
  }, [historico]);

  // Gerenciamento do cronômetro
  useEffect(() => {
    if (ativo) {
      intervaloRef.current = setInterval(() => {
        setTempoRestante((tempoAtual) => {
          if (tempoAtual <= 1) {
            clearInterval(intervaloRef.current);
            setAtivo(false);
            finalizarCiclo();
            return 0;
          }
          return tempoAtual - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervaloRef.current);
    }

    return () => clearInterval(intervaloRef.current);
  }, [ativo, modo, materiaSelecionada, materiaPersonalizada]);

  function finalizarCiclo() {
    tocarAlarmeFim();

    const materiaFinal = materiaPersonalizada.trim() || materiaSelecionada || "Estudos Gerais";

    if (modo === "foco") {
      const novaSessao = {
        id: `pomo-${Date.now()}`,
        materia: materiaFinal,
        minutos: Math.round(MODOS[modo].segundos / 60),
        data: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        dataCompleta: new Date().toLocaleDateString("pt-BR"),
      };

      setHistorico((antigo) => [novaSessao, ...antigo]);
      mostrarToast(`🍅 Ciclo concluído! Você estudou ${materiaFinal}. Hora de descansar!`, "sucesso");
    } else {
      mostrarToast("☕ Pausa encerrada! Pronto para o próximo ciclo de foco?", "aviso");
    }
  }

  function trocarModo(novoModo) {
    setModo(novoModo);
    setAtivo(false);
    setTempoRestante(MODOS[novoModo].segundos);
  }

  function alternarTimer() {
    setAtivo((prev) => !prev);
  }

  function reiniciarTimer() {
    setAtivo(false);
    setTempoRestante(MODOS[modo].segundos);
  }

  function formatarTempo(segundos) {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  }

  const minutosTotaisHoje = historico.reduce((acc, h) => acc + (h.minutos || 0), 0);
  const progressoPercent = ((MODOS[modo].segundos - tempoRestante) / MODOS[modo].segundos) * 100;

  return (
    <section className="pomodoro-secao">
      <div className="pomodoro-cabecalho">
        <div>
          <div className="badge-pomodoro">
            <IconeRelogio /> Foco Acadêmico
          </div>
          <h1>Timer Pomodoro</h1>
          <p className="pomodoro-subtitulo">
            Cronometre seu tempo de estudo, registre horas por matéria e receba aviso sonoro ao finalizar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            tocarAlarmeFim();
            mostrarToast("Alarme sonoro testado com sucesso!", "sucesso");
          }}
          className="botao-secundario botao-testar-som"
          title="Ouvir o som do alarme"
        >
          <IconeSino /> Testar Som
        </button>
      </div>

      <div className="pomodoro-layout">
        {/* Painel do Cronômetro */}
        <div className="card-pomodoro-timer">
          {/* Seletor de Modo */}
          <div className="pomodoro-modos">
            {Object.entries(MODOS).map(([chave, cfg]) => (
              <button
                key={chave}
                type="button"
                className={`botao-modo ${modo === chave ? "modo-ativo" : ""}`}
                onClick={() => trocarModo(chave)}
              >
                {cfg.rotulo}
              </button>
            ))}
          </div>

          {/* Vínculo com a Matéria */}
          {modo === "foco" && (
            <div className="pomodoro-selecao-materia">
              <label htmlFor="materia-select">Matéria de Estudo:</label>
              <select
                id="materia-select"
                value={materiaSelecionada}
                onChange={(e) => {
                  setMateriaSelecionada(e.target.value);
                  setMateriaPersonalizada("");
                }}
                disabled={ativo}
              >
                {materiasDisponiveis.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="Outra">+ Digitar outra matéria...</option>
              </select>

              {materiaSelecionada === "Outra" && (
                <input
                  type="text"
                  placeholder="Nome da disciplina..."
                  value={materiaPersonalizada}
                  onChange={(e) => setMateriaPersonalizada(e.target.value)}
                  disabled={ativo}
                  className="input-materia-extra"
                />
              )}
            </div>
          )}

          {/* Display do Relógio */}
          <div className="timer-display-circulo">
            <div className="timer-tempo">{formatarTempo(tempoRestante)}</div>
            <div className="timer-materia-label">
              {modo === "foco"
                ? `Estudando: ${materiaPersonalizada || materiaSelecionada || "Geral"}`
                : "Momento de Descanso"}
            </div>

            {/* Barra de Progresso Visual */}
            <div className="barra-progresso-fundo">
              <div
                className="barra-progresso-preenchimento"
                style={{ width: `${progressoPercent}%` }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="pomodoro-controles">
            <button
              type="button"
              className={`botao-timer ${ativo ? "botao-pausar" : "botao-iniciar"}`}
              onClick={alternarTimer}
            >
              {ativo ? "Pausar" : "Iniciar Foco"}
            </button>
            <button
              type="button"
              className="botao-secundario botao-reiniciar"
              onClick={reiniciarTimer}
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Painel Lateral: Resumo de Hoje e Histórico */}
        <div className="card-pomodoro-lateral">
          <div className="resumo-pomodoro-hoje">
            <div className="card-metrica-pomo">
              <span className="metrica-numero">{historico.length}</span>
              <span className="metrica-legenda">Ciclos Concluídos</span>
            </div>
            <div className="card-metrica-pomo">
              <span className="metrica-numero">{minutosTotaisHoje} min</span>
              <span className="metrica-legenda">Tempo Dedicado</span>
            </div>
          </div>

          <div className="historico-pomodoro-bloco">
            <h3>Histórico Recente de Estudos</h3>
            {historico.length === 0 ? (
              <p className="texto-sem-historico">
                Nenhum ciclo concluído ainda. Inicie seu primeiro Pomodoro!
              </p>
            ) : (
              <ul className="lista-historico-pomo">
                {historico.slice(0, 6).map((item) => (
                  <li key={item.id} className="item-historico-pomo">
                    <div>
                      <strong>{item.materia}</strong>
                      <small>{item.dataCompleta} às {item.data}</small>
                    </div>
                    <span className="badge-tempo">+{item.minutos}m</span>
                  </li>
                ))}
              </ul>
            )}

            {historico.length > 0 && (
              <button
                type="button"
                className="link-limpar-historico"
                onClick={() => {
                  if (window.confirm("Deseja zerar o histórico de ciclos estudados?")) {
                    setHistorico([]);
                    mostrarToast("Histórico de Pomodoro limpo.", "aviso");
                  }
                }}
              >
                Limpar histórico
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
