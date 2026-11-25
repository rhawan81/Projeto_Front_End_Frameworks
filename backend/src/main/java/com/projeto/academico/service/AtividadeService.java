package com.projeto.academico.service;

import com.projeto.academico.dto.AtividadeRequestDTO;
import com.projeto.academico.dto.AtividadeResponseDTO;
import com.projeto.academico.exception.ResourceNotFoundException;
import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Materia;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.model.Usuario;
import com.projeto.academico.repository.AtividadeRepository;
import com.projeto.academico.repository.MateriaRepository;
import com.projeto.academico.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AtividadeService {

    private final AtividadeRepository atividadeRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;

    public AtividadeService(AtividadeRepository atividadeRepository,
                            MateriaRepository materiaRepository,
                            UsuarioRepository usuarioRepository) {
        this.atividadeRepository = atividadeRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Mantém o filtro antigo ?materia=, além de ?materiaId= e ?situacao=.
    public List<AtividadeResponseDTO> listar(String email, Long materiaId,
                                             String materia, StatusAtividade situacao) {
        Usuario usuario = usuarioAutenticado(email);
        return atividadeRepository.findByUsuarioIdOrderByPrazoAscIdAsc(usuario.getId())
                .stream()
                .filter(a -> materiaId == null || a.getMateria().getId().equals(materiaId))
                .filter(a -> materia == null || a.getMateria().getNome().equalsIgnoreCase(materia.trim()))
                .filter(a -> situacao == null || a.getStatus() == situacao)
                .map(this::paraResponseDTO)
                .toList();
    }

    public AtividadeResponseDTO buscarPorId(String email, Long id) {
        return paraResponseDTO(atividadeDoUsuario(id, usuarioAutenticado(email).getId()));
    }

    @Transactional
    public AtividadeResponseDTO criar(String email, AtividadeRequestDTO dto) {
        Usuario usuario = usuarioAutenticado(email);
        Materia materia = buscarMateria(dto.materiaId());

        Atividade atividade = new Atividade();
        atividade.setTitulo(dto.titulo().trim());
        atividade.setMateria(materia);
        atividade.setUsuario(usuario);
        atividade.setDescricao(dto.descricao());
        atividade.setPrazo(dto.prazo());
        atividade.setPrioridade(dto.prioridade());
        atividade.setStatus(dto.status() != null ? dto.status() : StatusAtividade.PENDENTE);
        return paraResponseDTO(atividadeRepository.saveAndFlush(atividade));
    }

    @Transactional
    public AtividadeResponseDTO atualizar(String email, Long id, AtividadeRequestDTO dto) {
        Atividade atividade = atividadeDoUsuario(id, usuarioAutenticado(email).getId());
        Materia materia = buscarMateria(dto.materiaId());

        atividade.setTitulo(dto.titulo().trim());
        atividade.setMateria(materia);
        atividade.setDescricao(dto.descricao());
        atividade.setPrazo(dto.prazo());
        atividade.setPrioridade(dto.prioridade());
        if (dto.status() != null) {
            atividade.setStatus(dto.status());
        }
        return paraResponseDTO(atividadeRepository.saveAndFlush(atividade));
    }

    @Transactional
    public AtividadeResponseDTO atualizarSituacao(String email, Long id, StatusAtividade novoStatus) {
        Atividade atividade = atividadeDoUsuario(id, usuarioAutenticado(email).getId());
        atividade.setStatus(novoStatus);
        return paraResponseDTO(atividadeRepository.saveAndFlush(atividade));
    }

    @Transactional
    public void excluir(String email, Long id) {
        Atividade atividade = atividadeDoUsuario(id, usuarioAutenticado(email).getId());
        atividadeRepository.delete(atividade);
        atividadeRepository.flush();
    }

    private Usuario usuarioAutenticado(String email) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
    }

    private Materia buscarMateria(Long materiaId) {
        return materiaRepository.findById(materiaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Matéria com ID " + materiaId + " não encontrada."));
    }

    private Atividade atividadeDoUsuario(Long id, Long usuarioId) {
        return atividadeRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Atividade com ID " + id + " não encontrada."));
    }

    private AtividadeResponseDTO paraResponseDTO(Atividade a) {
        return new AtividadeResponseDTO(
                a.getId(), a.getTitulo(), a.getMateria().getId(),
                a.getMateria().getNome(), a.getDescricao(), a.getPrazo(),
                a.getPrioridade(), a.getStatus());
    }
}
