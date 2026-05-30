<template>
  <footer class="footer" id="contato">
    <div class="container footer-content">
      <div class="footer-brand">
        <div class="logo">
          <img src="https://asfldefzwlocpuszoedj.supabase.co/storage/v1/object/public/LOGO/ONE%20CLINIC%20-%20LOGO%20-%20PNG.png" alt="One Clinic Logo" class="logo-img-footer" />
          <span class="logo-text">
            <span class="logo-one footer-logo-one">ONE</span>
            <span class="logo-clinic footer-logo-clinic">clinic</span>
          </span>
        </div>
        <p class="footer-tagline">Gestão inteligente para clínicas de estética</p>
      </div>
      <div class="footer-links">
        <div class="footer-column">
          <h4>Produto</h4>
          <a href="#">Recursos</a>
          <a href="#">Preços</a>
          <a href="#">Integrações</a>
        </div>
        <div class="footer-column">
          <h4>Empresa</h4>
          <a href="#">Sobre</a>
          <a href="#">Blog</a>
          <a href="#">Carreiras</a>
        </div>
        <div class="footer-column">
          <h4>Suporte</h4>
          <a href="#">Central de Ajuda</a>
          <a href="#">Contato</a>
          <a href="#">Status</a>
        </div>
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="container footer-bottom">
      <p>© 2026 OneClinic. Todos os direitos reservados.</p>
      <div class="footer-legal">
        <a href="#">Termos</a>
        <a href="#">Privacidade</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--cor-escura);
  color: white;
  padding: 4rem 0 2rem;
}
.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 3rem;
  margin-bottom: 2rem;
}
.footer-logo-one {
  color: white;
}
.footer-logo-clinic {
  color: var(--cor-clara);
}
.footer-tagline {
  margin-top: 1rem;
  color: #D1D5DB;
  line-height: 1.6;
}
.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.footer-column h4 {
  margin-bottom: 1rem;
  color: white;
}
.footer-column a {
  display: block;
  text-decoration: none;
  color: #D1D5DB;
  margin-bottom: 0.7rem;
  transition: color 0.3s ease, transform 0.3s ease;
}
.footer-column a:hover {
  color: var(--cor-primaria);
  transform: translateX(5px);
}
.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 2rem;
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #9CA3AF;
  font-size: 0.9rem;
}
.footer-legal {
  display: flex;
  gap: 1.5rem;
}
.footer-legal a {
  text-decoration: none;
  color: #9CA3AF;
  transition: color 0.3s ease;
}
.footer-legal a:hover {
  color: white;
}

@media (max-width: 768px) {
  .footer-content,
  .footer-links {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>